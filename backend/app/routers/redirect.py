from fastapi import APIRouter, Depends
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app import models
from app.database import get_db

router = APIRouter(tags=["redirect"])


@router.get("/r/{tracking_id}", response_class=HTMLResponse)
def track_and_show(tracking_id: str, db: Session = Depends(get_db)):
    coupon = db.query(models.Coupon).filter_by(tracking_id=tracking_id).first()
    if not coupon:
        return HTMLResponse("<h1>Lien invalide ou expiré</h1>", status_code=404)

    # Enregistre le clic si c'est le premier
    if coupon.status == models.CouponStatus.GENERATED:
        coupon.status = models.CouponStatus.CLICKED
        coupon.clicked_at = datetime.now(timezone.utc)
        db.commit()

    bookmaker_url = coupon.bookmaker.base_url

    html = f'''
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Coupon {coupon.bookmaker.name}</title>
        <style>
            body {{ font-family: system-ui, sans-serif; max-width: 500px; margin: 2rem auto; padding: 1rem; background: #f9fafb; }}
            .card {{ background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }}
            h2 {{ margin-top: 0; color: #1f2937; }}
            .meta {{ color: #4b5563; font-size: 1rem; margin: 0.5rem 0; display: flex; justify-content: space-between; }}
            .odds {{ font-size: 1.5rem; font-weight: bold; color: #2563eb; }}
            .btn {{ display: block; text-align: center; padding: 1rem; margin: 0.8rem 0; border-radius: 8px; text-decoration: none; font-weight: 600; cursor: pointer; border: none; width: 100%; font-size: 1rem; }}
            .btn-primary {{ background: #2563eb; color: white; }}
            .btn-success {{ background: #16a34a; color: white; }}
            .btn-danger {{ background: #dc2626; color: white; }}
            .hidden {{ display: none; }}
            hr {{ border: 0; border-top: 1px solid #e5e7eb; margin: 1.5rem 0; }}
        </style>
    </head>
    <body>
        <div class="card">
            <h2>Coupon {coupon.bookmaker.name}</h2>
            <div class="meta"><span>Mise :</span> <strong>{coupon.stake} €</strong></div>
            <div class="meta"><span>Cote totale :</span> <span class="odds">{coupon.total_odds}</span></div>
            <div class="meta"><span>Gain potentiel :</span> <strong>{coupon.potential_gain} €</strong></div>
            
            <hr>
            
            <a href="{bookmaker_url}" class="btn btn-primary" target="_blank" rel="noopener">
                ➡️ Ouvrir {coupon.bookmaker.name}
            </a>
            
            <hr>
            
            <p style="text-align:center; color:#6b7280; font-size:0.9rem;">Après avoir placé votre pari sur le site, confirmez-le ici :</p>
            
            <div id="actions">
                <button class="btn btn-success" onclick="confirmBet(true)">✅ J'ai placé le pari</button>
                <button class="btn btn-danger" onclick="confirmBet(false)">❌ Je n'ai pas placé</button>
            </div>
            <p id="msg" style="text-align:center; font-weight:bold; color:#16a34a; margin-top:1rem;"></p>
        </div>

        <script>
            async function confirmBet(placed) {{
                document.getElementById("actions").classList.add("hidden");
                const res = await fetch("/coupons/{tracking_id}/confirm", {{
                    method: "POST",
                    headers: {{ "Content-Type": "application/json" }},
                    body: JSON.stringify({{ placed: placed }})
                }});
                if (res.ok) {{
                    document.getElementById("msg").innerText = placed 
                        ? "✅ Pari enregistré comme PLACÉ." 
                        : "❌ Pari enregistré comme NON PLACÉ.";
                }} else {{
                    document.getElementById("msg").innerText = "⚠️ Erreur lors de la confirmation.";
                    document.getElementById("msg").style.color = "red";
                }}
            }}
        </script>
    </body>
    </html>
    '''
    return HTMLResponse(html)
