# app/utils/logger.py
import logging
from logging.handlers import RotatingFileHandler
import os


def setup_logging(app):
    """
    Configures production-grade logging for the entire application.
    Logs are written to:
        - console (stdout)
        - rotating log file: logs/app.log (max 5MB, 5 backups)
    """

    # Directory for logs
    log_dir = os.path.join(app.root_path, "..", "logs")
    os.makedirs(log_dir, exist_ok=True)

    log_file = os.path.join(log_dir, "app.log")

    # Logging level (DEBUG/INFO/WARNING/ERROR)
    level = app.config.get("LOG_LEVEL", "INFO")

    # Root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(name)s:%(lineno)d | %(message)s"
    )

    # ------------------------------------------------------------
    # Rotating File Handler (persistent logs)
    # ------------------------------------------------------------
    file_handler = RotatingFileHandler(
        log_file,
        maxBytes=5 * 1024 * 1024,   # 5 MB
        backupCount=5,
        encoding="utf-8"
    )
    file_handler.setLevel(level)
    file_handler.setFormatter(formatter)
    root_logger.addHandler(file_handler)

    # ------------------------------------------------------------
    # Console Handler (developer-friendly logs)
    # ------------------------------------------------------------
    console_handler = logging.StreamHandler()
    console_handler.setLevel(level)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    # Ensure app logger uses the same config
    app.logger.setLevel(level)
