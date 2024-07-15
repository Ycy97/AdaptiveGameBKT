from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from pyBKT_model import BKT
from bkt_model2 import update_knowledge

app = Flask(__name__)
# Allow CORS for all domains on all routes
CORS(app, resources={r"/*": {"origins": "*"}})


# MYSQL database connection configuration parameters
db_config = {
    'host': "localhost",
    'user': "root",
    'password': "khcy6ycy",
    'database': "math_question",
    'port': 3306
}

print("Ready to connect to database")

@app.route('/', methods=['GET'])
def index():
    return jsonify({"message": "Welcome to the Math Questions API!"})

@app.route('/algebra', methods=['GET'])
def get_algebra_questions():
    # Create a new connection using the db_config dictionary
    conn = mysql.connector.connect(**db_config)
    cur = conn.cursor(dictionary=True) # This ensures you get column names in your result
    cur.execute("SELECT * FROM algebra")
    questions = cur.fetchall()
    cur.close()
    conn.close()
    # No need to convert to dict, as cursor(dictionary=True) does that
    return jsonify(questions)

@app.route('/numbers', methods=['GET'])
def get_numbers_questions():
    # Create a new connection using the db_config dictionary
    conn = mysql.connector.connect(**db_config)
    cur = conn.cursor(dictionary=True) # This ensures you get column names in your result
    cur.execute("SELECT * FROM numbers")
    questions = cur.fetchall()
    cur.close()
    conn.close()
    # No need to convert to dict, as cursor(dictionary=True) does that
    return jsonify(questions)

@app.route('/probabilityandstatistics', methods=['GET'])
def get_probabilityandstatistics_questions():
    # Create a new connection using the db_config dictionary
    conn = mysql.connector.connect(**db_config)
    cur = conn.cursor(dictionary=True) # This ensures you get column names in your result
    cur.execute("SELECT * FROM probabilityandstatistics")
    questions = cur.fetchall()
    cur.close()
    conn.close()
    # No need to convert to dict, as cursor(dictionary=True) does that
    return jsonify(questions)

#API to call pyBKT
@app.route('/getMastery')
def getSkilllMasteries():
    tableName = "recommendation_engine.ct_cy"
    #user_id get a fake one as you only have one user
    user_id = "6zkEsmR"
    skillMastery= BKT(tableName, user_id)
    return jsonify(skillMastery)


#API to call bkt_yt for ASG, call made per questions answered
@app.route('/getStudentMastery', methods=['POST'])
def getStudentMasteries():
    data = request.get_json()
    state = float(data.get('state'))
    correct = data.get('correct')
    difficulty = str(data.get('difficulty'))
    response_time = float(data.get('response_time'))
    latest_state = update_knowledge(state, correct, difficulty, response_time)
    obtainedMastery ={
        'mastery' : latest_state
    }

    return jsonify(obtainedMastery)


#API to save user question-answer response
@app.route('/save_response', methods=['POST'])
def save_responses():
    data =  request.get_json()
    response = jsonify({'message' : 'Data saved successfully'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    user_id = data.get('user_id')
    question_id = data.get('question_id')
    correctness = data.get('correctness')
    skill = data.get('skill')
    conn = mysql.connector.connect(**db_config)
    cur = conn.cursor()
    insert_query = "INSERT INTO student_interaction (user_id, question_id, correctness, skill) VALUES (%s, %s, %s, %s)"
    cur.execute(insert_query, (user_id, question_id, correctness, skill))
    conn.commit()
    cur.close()
    conn.close()

    return response


if __name__ == '__main__':
    app.run(debug=True)
