import requests

def test_full_system():
    print("=== RUNNING FULL END-TO-END VERIFICATION ===")
    # 1. Health
    h = requests.get("http://127.0.0.1:8000/api/health", timeout=5).json()
    assert h["status"] == "healthy", "Health check failed"
    assert h["model_loaded"] is True, "Model not loaded"
    assert h["shap_available"] is True, "SHAP not loaded"
    assert h["dice_available"] is True, "DiCE not loaded"
    assert h["mapie_available"] is True, "MAPIE not loaded"
    print("[PASS] Health check: All models, explainers, and conformal predictors healthy.")

    # 2. Sample Customers
    samples = requests.get("http://127.0.0.1:8000/api/customers/sample?count=5", timeout=5).json()
    assert len(samples) == 5, "Sample customer retrieval failed"
    print(f"[PASS] Sample customers retrieved: {len(samples)} valid benchmark records.")

    # 3. Master Decision Support Endpoint (Single-Click Flow)
    test_borrower = samples[0]["features"]
    res = requests.post("http://127.0.0.1:8000/api/analyze", json={"applicant": test_borrower}, timeout=20).json()
    assert res["success"] is True, "Master analysis failed"
    assert "prediction" in res, "Prediction missing"
    assert "explanation" in res, "SHAP explanation missing"
    assert "counterfactuals" in res, "DiCE counterfactuals missing"
    assert "uncertainty" in res, "MAPIE uncertainty missing"
    assert "decision_summary" in res, "Decision summary missing"
    
    pred = res["prediction"]
    shap_f = res["explanation"]["top_factors"][0]
    print(f"[PASS] Master Decision Journey:")
    print(f"       Outcome: {pred['label']} (Prob: {pred['probability_good']*100:.1f}% Good / {pred['probability_bad']*100:.1f}% Bad)")
    print(f"       SHAP top factor: {shap_f['feature']} ({shap_f['shap_value']:.3f}, {shap_f['direction']})")
    print(f"       DiCE recourse paths: {len(res['counterfactuals']['results'])}")
    print(f"       MAPIE conformal set: {res['uncertainty']['prediction_set']} (coverage: {res['uncertainty']['empirical_coverage']*100:.1f}%)")
    print(f"       Fairness disparity detected: {res['fairness']['disparity_detected']}")
    print(f"       Summary: {res['decision_summary'][:90]}...")

    # 4. Database Audit Persistence
    history = requests.get("http://127.0.0.1:8000/api/predictions/history", timeout=5).json()
    assert len(history) > 0, "No audit records found"
    print(f"[PASS] Database audit log: {len(history)} records persisted, latest audit ID = {history[0]['id']}.")

    # 5. Frontend Dev Server Check
    fe = requests.get("http://127.0.0.1:5173", timeout=5)
    assert fe.status_code == 200, "Frontend server not serving 200 OK"
    print("[PASS] Frontend React app: Serving 200 OK on http://127.0.0.1:5173")
    print("=== ALL ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY ===")

if __name__ == "__main__":
    test_full_system()
