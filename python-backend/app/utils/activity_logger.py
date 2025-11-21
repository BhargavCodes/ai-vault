# app/utils/activity_logger.py
from app import db
from datetime import datetime, timezone
from app.models import ActivityLog
import logging
from flask import has_app_context

logger = logging.getLogger(__name__)

def log_activity(user_id, action, route="/unknown"):
    """
    Save activity in DB and write a logger entry.
    """
    # Safety check: Ensure we are in an app context
    if not has_app_context():
        logger.warning("Attempted to log activity outside of application context.")
        return

    try:
        entry = ActivityLog(
            user_id=user_id,
            action=action,
            route=route,
            timestamp=datetime.now(timezone.utc)
        )
        db.session.add(entry)
        db.session.commit()
        logger.info(f"Activity logged: user={user_id} action={action} route={route}")

    except Exception as e:
        logger.exception(f"Failed to log activity: {e}")
        # Only rollback if the session is active
        try:
            db.session.rollback()
        except:
            pass