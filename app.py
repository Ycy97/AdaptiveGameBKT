from flask import Flask, jsonify, request, session, render_template, redirect, url_for
from flask_session import Session
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import mysql.connector
from pyBKT_model import BKT
from bkt_model2 import update_knowledge
from openai import OpenAI

app = Flask(__name__)
app.secret_key = 'cy_secretKey'

# Allow CORS for all domains on all routes
CORS(app, resources={r"/*": {"origins": "*", "supports_credentials": True}})
bcrypt = Bcrypt(app)

# MYSQL database connection configuration parameters
db_config = {
    'host': "localhost",
    'user': "root",
    'password': "khcy6ycy",
    'database': "math_question",
    'port': 3306
}

db_config2 = {
    'host': "localhost",
    'user': "root",
    'password': "khcy6ycy",
    'database': "recommendation_engine",
    'port': 3306
}

print("Ready to connect to database")

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

#API methods to call algebra, numbers, and prob&statistics - need to modify where it selects the difficulty
@app.route('/algebraEasy', methods=['GET'])
def get_algebra_questionsEasy():
    conn = mysql.connector.connect(**db_config)
    cur = conn.cursor(dictionary=True) # This ensures you get column names in your result
    cur.execute("SELECT * FROM algebra WHERE difficulty = 'Easy'")
    questions = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(questions)

@app.route('/algebraMedium', methods=['GET'])
def get_algebra_questionsMedium():
    conn = mysql.connector.connect(**db_config)
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM algebra where difficulty = 'Medium'")
    questions = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(questions)

@app.route('/algebraHard', methods=['GET'])
def get_algebra_questionsHard():
    conn = mysql.connector.connect(**db_config)
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM algebra WHERE difficulty = 'Hard'")
    questions = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(questions)

@app.route('/numbersEasy', methods=['GET'])
def get_numbers_questionsEasy():
    # Create a new connection using the db_config dictionary
    conn = mysql.connector.connect(**db_config)
    cur = conn.cursor(dictionary=True) # This ensures you get column names in your result
    cur.execute("SELECT * FROM numbers WHERE difficulty = 'Easy'")
    questions = cur.fetchall()
    cur.close()
    conn.close()
    # No need to convert to dict, as cursor(dictionary=True) does that
    return jsonify(questions)

@app.route('/numbersMedium', methods=['GET'])
def get_numbers_questionsMedium():
    # Create a new connection using the db_config dictionary
    conn = mysql.connector.connect(**db_config)
    cur = conn.cursor(dictionary=True) # This ensures you get column names in your result
    cur.execute("SELECT * FROM numbers WHERE difficulty = 'Medium'")
    questions = cur.fetchall()
    cur.close()
    conn.close()
    # No need to convert to dict, as cursor(dictionary=True) does that
    return jsonify(questions)

@app.route('/numbersHard', methods=['GET'])
def get_numbers_questionsHard():
    # Create a new connection using the db_config dictionary
    conn = mysql.connector.connect(**db_config)
    cur = conn.cursor(dictionary=True) # This ensures you get column names in your result
    cur.execute("SELECT * FROM numbers WHERE difficulty = 'Hard'")
    questions = cur.fetchall()
    cur.close()
    conn.close()
    # No need to convert to dict, as cursor(dictionary=True) does that
    return jsonify(questions)

@app.route('/probabilityandstatisticsEasy', methods=['GET'])
def get_probabilityandstatistics_questionsEasy():
    conn = mysql.connector.connect(**db_config)
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM probabilityandstatistics WHERE difficulty = 'Easy'")
    questions = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(questions)

@app.route('/probabilityandstatisticsMedium', methods=['GET'])
def get_probabilityandstatistics_questionsMedium():
    conn = mysql.connector.connect(**db_config)
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM probabilityandstatistics WHERE difficulty = 'Medium'")
    questions = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(questions)

@app.route('/probabilityandstatisticsHard', methods=['GET'])
def get_probabilityandstatistics_questionsHard():
    conn = mysql.connector.connect(**db_config)
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM probabilityandstatistics WHERE difficulty = 'Hard'")
    questions = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(questions)

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

#API to allow user to login into the game
@app.route('/login', methods=['POST'])
def gameLogin():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    conn = mysql.connector.connect(**db_config2)
    cur = conn.cursor()
    auth_query = "SELECT * FROM users WHERE studentID =%s"
    cur.execute(auth_query, (username,))
    user = cur.fetchone()

    if user:
        stored_password_hash = user[1]
        if bcrypt.check_password_hash(stored_password_hash, password):
            #session['username'] = username
            #print("Session data after login:", session.get('username'))
            cur.close()
            conn.close()
            return jsonify({'message' : 'Login successful!'}),200
        else:
            cur.close()
            conn.close()
            return jsonify({'message': 'Invalid username or password'}), 401
    else:
        cur.close()
        conn.close()
        return jsonify({'message': 'Invalid username or password'}), 401

#API to allow user to signup/register
@app.route('/signup', methods=['POST'])
def gameSignup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    conn = mysql.connector.connect(**db_config2)
    cur = conn.cursor()
    auth_query = "SELECT * FROM users WHERE studentID =%s"
    cur.execute(auth_query, (username,))
    user = cur.fetchone()

    if user:
        return jsonify({'message': 'User already exists'}), 400
    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    register_query = "INSERT INTO users (studentID, password_hash) VALUES (%s, %s)"
    cur.execute(register_query, (username, password_hash))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'message': 'User registered successfully'}), 201

#API to logout user
@app.route('/logout',methods=['POST'])
def logout():
    #session.pop('username', None)
    return jsonify({'message': 'Logged out successfully'}), 200


#API to call chatGPT completion
@app.route('/chatgpt', methods=['POST'])
def chatgpt_prompt():
    client = OpenAI()
    messages = []
    data = request.json
    prompt = data.get('prompt')
    #Augment the prompt to not provide answers but hints instead
    augment =  "Do not provide the direct answers except for formulas. Give me the hints only with simple explanation."
    prompt = prompt + augment

    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400
    
    try:
        messages.append({"role": "user", "content": prompt})
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages = messages,
            max_tokens= 100
        )
        chat_message = response.choices[0].message.content
        messages.append({"role": "assistant", "content": chat_message})
        return jsonify({"response": chat_message})
    except Exception as e:
         return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
