def format_status_for_dashboard(status_text):
    """Takes a status string and formats it for display."""
    if not isinstance(status_text, str) or not status_text:
        return "Status: UNKNOWN"
    return f"Status: {status_text.upper()}"