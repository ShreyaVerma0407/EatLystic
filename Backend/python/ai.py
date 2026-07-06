from flask import Flask, request, jsonify
from eatlystic_bill_parser import process_bill_image

app = Flask(__name__)

@app.route("/scan", methods=["POST"])
def scan():
    file = request.files["image"]

    path = f"/tmp/{file.filename}"
    file.save(path)

    items, _ = process_bill_image(path)

    return jsonify([i.to_dict() for i in items])


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)