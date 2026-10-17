from app.worker import celery_app
from app.database import SessionLocal
from app.models import Team, League, Match
from app.services.football_api import get_today_matches
from datetime import datetime

@celery_app.task
def sync_today_matches():
    """Tâche qui récupère les matchs du jour et les sauvegarde en base."""
    print("Début de la synchronisation des matchs...")
    db = SessionLocal()
    try:
        matches_data = get_today_matches()
        count_added = 0

        for m in matches_data:
            # 1. Sauvegarder la Ligue
            league_info = m['league']
            league = db.query(League).filter_by(id=league_info['id']).first()
            if not league:
                league = League(
                    id=league_info['id'],
                    name=league_info['name'],
                    country=league_info['country'],
                    logo_url=league_info['logo'],
                    season=league_info['season']
                )
                db.add(league)
                db.flush()

            # 2. Sauvegarder les Équipes
            home_info = m['teams']['home']
            home_team = db.query(Team).filter_by(id=home_info['id']).first()
            if not home_team:
                home_team = Team(id=home_info['id'], name=home_info['name'], logo_url=home_info['logo'])
                db.add(home_team)
                db.flush()

            away_info = m['teams']['away']
            away_team = db.query(Team).filter_by(id=away_info['id']).first()
            if not away_team:
                away_team = Team(id=away_info['id'], name=away_info['name'], logo_url=away_info['logo'])
                db.add(away_team)
                db.flush()

            # 3. Sauvegarder le Match
            match = db.query(Match).filter_by(id=m['fixture']['id']).first()
            if not match:
                # Conversion de la date ISO 8601 de l'API vers datetime
                match_date = datetime.fromisoformat(m['fixture']['date'].replace("Z", "+00:00"))
                
                match = Match(
                    id=m['fixture']['id'],
                    league_id=league.id,
                    home_team_id=home_team.id,
                    away_team_id=away_team.id,
                    match_date=match_date,
                    status=m['fixture']['status']['short'],
                    home_goals=m['goals']['home'],
                    away_goals=m['goals']['away']
                )
                db.add(match)
                count_added += 1

        db.commit()
        print(f"Synchronisation terminée. {count_added} nouveaux matchs ajoutés.")
        return f"{count_added} matchs ajoutés"
    except Exception as e:
        db.rollback()
        print(f"Erreur lors de la synchronisation : {e}")
        raise e
    finally:
        db.close()
