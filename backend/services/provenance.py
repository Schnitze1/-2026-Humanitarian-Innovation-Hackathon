import os
import json
import config


def get_provenance_log(report_id: str) -> dict:
    """
    :param report_id: ID of the generated report.
    :return: A dict containing the report_id and parsed spans list.
    """
    report_file = config.reports_dir / f"{report_id}.json"
    if not os.path.exists(report_file):
        raise FileNotFoundError(f"Report ID {report_id} does not exist")

    with open(report_file, "r", encoding="utf-8") as f:
        report_data = json.load(f)

    return {
        "report_id": report_id,
        "spans": report_data.get("spans", [])
    }
