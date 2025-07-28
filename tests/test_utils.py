from backend.utils import format_status_for_dashboard

def test_format_status_normal():
    """Tests the function with a normal status string."""
    assert format_status_for_dashboard("Normal") == "Status: NORMAL"

def test_format_status_fault():
    """Tests the function with a different status string."""
    assert format_status_for_dashboard("Fault") == "Status: FAULT"

def test_format_status_empty():
    """Tests the function with an empty input."""
    assert format_status_for_dashboard("") == "Status: UNKNOWN"

def test_format_status_none():
    """Tests the function with a None input."""
    assert format_status_for_dashboard(None) == "Status: UNKNOWN"