import requests
import uuid

def test_full_system(base_url="http://127.0.0.1:8000"):
    print("=== RUNNING FULL END-TO-END SYSTEM VERIFICATION ===")
    
    # 1. Health
    h = requests.get(f"{base_url}/api/health", timeout=5).json()
    assert h["status"] == "healthy", "Health check failed"
    assert h["model_loaded"] is True, "Model not loaded"
    assert h["shap_available"] is True, "SHAP not loaded"
    assert h["dice_available"] is True, "DiCE not loaded"
    assert h["mapie_available"] is True, "MAPIE not loaded"
    print("[PASS] Health check: All models, explainers, and conformal predictors healthy.")

    # 2. Registration & Authentication
    uid = uuid.uuid4().hex[:6]
    test_user = {
        "first_name": "Verification",
        "last_name": f"Officer_{uid}",
        "date_of_birth": "1992-08-20",
        "gender": "Female",
        "phone": "+1 555-019-9944",
        "email": f"verify_{uid}@enterprise.com",
        "organization": "Enterprise Decision Systems",
        "job_title": "Credit Analytics Lead",
        "department": "Risk Governance",
        "years_of_experience": 6.0,
        "username": f"verifier_{uid}",
        "password": "StrongPassword99#",
        "confirm_password": "StrongPassword99#",
        "terms_accepted": True,
        "privacy_accepted": True
    }
    reg = requests.post(f"{base_url}/api/auth/register", json=test_user, timeout=5)
    assert reg.status_code == 201, f"Registration failed: {reg.text}"
    print(f"[PASS] Authentication: Registered new user '{test_user['username']}'.")

    # Login
    login_res = requests.post(f"{base_url}/api/auth/login", json={
        "username_or_email": test_user["username"],
        "password": test_user["password"]
    }, timeout=5)
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[PASS] Authentication: Login verified, JWT bearer token issued.")

    # Profile verification
    me_res = requests.get(f"{base_url}/api/auth/me", headers=headers, timeout=5).json()
    assert me_res["email"] == test_user["email"]
    assert me_res["role"] == "user"
    print(f"[PASS] User Profile: Persisted profile retrieved for User #{me_res['id']}.")

    # 3. Sample Customers
    samples = requests.get(f"{base_url}/api/customers/sample?count=5", timeout=5).json()
    assert len(samples) == 5, "Sample customer retrieval failed"
    print(f"[PASS] Sample customers retrieved: {len(samples)} valid benchmark records.")

    # 4. Master Decision Support Endpoint with Persistent DB Storage
    test_borrower = samples[0]["features"]
    analysis_payload = {
        "applicant": test_borrower,
        "analysis_name": f"E2E Audit Run {uid}",
        "applicant_reference": f"REF-{uid}",
        "model_name": "xgboost"
    }
    res = requests.post(f"{base_url}/api/analyze", json=analysis_payload, headers=headers, timeout=25).json()
    assert res["success"] is True, "Master analysis failed"
    assert "prediction" in res, "Prediction missing"
    assert "explanation" in res, "SHAP explanation missing"
    assert "counterfactuals" in res, "DiCE counterfactuals missing"
    assert "uncertainty" in res, "MAPIE uncertainty missing"
    assert "decision_summary" in res, "Decision summary missing"
    assert res.get("analysis_id") is not None, "Persistent analysis ID missing!"

    pred = res["prediction"]
    shap_f = res["explanation"]["top_factors"][0]
    print(f"[PASS] Master Decision Journey:")
    print(f"       Analysis ID: #{res['analysis_id']}")
    print(f"       Outcome: {pred['label']} (Prob: {pred['probability_good']*100:.1f}% Good / {pred['probability_bad']*100:.1f}% Bad)")
    print(f"       SHAP top factor: {shap_f['feature']} ({shap_f['shap_value']:.3f}, {shap_f['direction']})")
    print(f"       DiCE recourse paths: {len(res['counterfactuals']['results'])}")
    print(f"       MAPIE conformal set: {res['uncertainty']['prediction_set']} (coverage: {res['uncertainty']['empirical_coverage']*100:.1f}%)")
    print(f"       Fairness disparity detected: {res['fairness']['disparity_detected']}")

    # 5. Persistent Analysis History Retrieval
    history = requests.get(f"{base_url}/api/analyses", headers=headers, timeout=5).json()
    assert history["total"] >= 1, "No saved analyses found in history"
    saved_item = history["items"][0]
    assert saved_item["id"] == res["analysis_id"]
    print(f"[PASS] Persistent History: Analysis #{saved_item['id']} successfully retrieved from PostgreSQL.")

    # 6. Database Audit Persistence
    audit_logs = requests.get(f"{base_url}/api/predictions/history", timeout=5).json()
    assert len(audit_logs) > 0, "No audit records found"
    print(f"[PASS] Database audit log: {len(audit_logs)} records persisted.")

    print("=== ALL ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY ===")

if __name__ == "__main__":
    test_full_system()
