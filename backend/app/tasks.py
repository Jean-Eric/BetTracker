from app.worker import celery_app
from app.database import SessionLocal
from app.models import Team, League, Match, Analysis
from app.services.football_api import get_today_matches
from datetime import datetime

@celery_app.task
def sync_today_matches():
    """Tâche qui récupère les matchs du jour et les sauvegarde en base."""
    db = SessionLocal()
    try:
        matches_data = get_today_matches()
        count_added = 0
        count_updated = 0

        for m in matches_data:
            league_info = m['league']
            league = db.query(League).filter_by(id=league_info['id']).first()
            if not league:
                league = League(id=league_info['id'], name=league_info['name'], country=league_info['country'], logo_url=league_info['logo'], season=league_info['season'])
                db.add(league)
                db.flush()

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

            match = db.query(Match).filter_by(id=m['fixture']['id']).first()
            if not match:
                match_date = datetime.fromisoformat(m['fixture']['date'].replace("Z", "+00:00"))
                match = Match(id=m['fixture']['id'], league_id=league.id, home_team_id=home_team.id, away_team_id=away_team.id, match_date=match_date, status=m['fixture']['status']['short'], elapsed=m['fixture']['status']['elapsed'], home_goals=m['goals']['home'], away_goals=m['goals']['away'])
                db.add(match)
                count_added += 1
            else:
                match.status = m['fixture']['status']['short']
                match.elapsed = m['fixture']['status']['elapsed']
                match.home_goals = m['goals']['home']
                match.away_goals = m['goals']['away']
                count_updated += 1
        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

@celery_app.task
def resolve_predictions():
    """Tâche qui vérifie les matchs terminés et met à jour les analyses."""
    db = SessionLocal()
    try:
        pending_analyses = db.query(Analysis).join(Match).filter(
            Analysis.status == 'PENDING',
            Match.status == 'FT'
        ).all()

        for a in pending_analyses:
            match = a.match
            if a.prediction_type == '1X2':
                val = a.prediction_value.lower()
                if ('domicile' in val or val == 'v1') and match.home_goals > match.away_goals:
                    a.status = 'WON'
                elif ('exterieur' in val or val == 'v2') and match.away_goals > match.home_goals:
                    a.status = 'WON'
                elif val == 'nul' and match.home_goals == match.away_goals:
                    a.status = 'WON'
                else:
                    a.status = 'LOST'
            elif a.prediction_type == 'Over/Under':
                total = match.home_goals + match.away_goals
                if 'plus' in a.prediction_value.lower() and total > 2.5:
                    a.status = 'WON'
                elif 'moins' in a.prediction_value.lower() and total <= 2.5:
                    a.status = 'WON'
                else:
                    a.status = 'LOST'
            elif a.prediction_type == 'BTTS':
                if match.home_goals > 0 and match.away_goals > 0:
                    a.status = 'WON'
                else:
                    a.status = 'LOST'
        
        db.commit()
    finally:
        db.close()
