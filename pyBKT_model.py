#BKT model using pyBKT for Knowledge Tracing task

from pyBKT.models import Model
import pandas as pd
import mysql.connector
from sqlalchemy import create_engine

host = 'localhost'
user = 'root'
password = 'khcy6ycy'
database = 'recommendation_engine'

cnx = mysql.connector.connect(user='root', password='khcy6ycy', host='localhost', database='recommendation_engine')
connection_string = f'mysql+mysqlconnector://{user}:{password}@{host}/{database}'
engine = create_engine(connection_string, echo=False)
cursor = cnx.cursor()

def BKT(tableName, user_id):
    #return student individual data
    tableName = tableName
    user_id = user_id
    sql_query = "SELECT * FROM " + tableName + " WHERE studentID = " + "'" + user_id + "'" + " ORDER BY endTime ASC;"
    cursor.execute(sql_query)
    results = cursor.fetchall()
    student_df = pd.DataFrame(results, columns=['studentID', 'startTime','endTime','correct','skill'])
    cursor.close()

    #declare parameters for pyBKT model
    defaults = {'user_id': 'studentID', 'skill_name': 'skill', 'correct': 'correct', 'start_time': 'startTime',
                'end_time': 'endTime', 'multilearn': 'studentID', 'multigs' : True}
    model = Model(seed=42, num_fits=1)
    model.fit(data = student_df, defaults=defaults)

    #get the Root Mean Squared Error (RMSE)
    training_rmse = model.evaluate(data = student_df)
    #get the Area Under the Curve (AUC)
    training_auc = model.evaluate(data = student_df, metric = 'auc')
    #get the accuracy
    training_acc = model.evaluate(data = student_df, metric = 'accuracy')
    
    print("Training RMSE: %f" % training_rmse)
    print("Training AUC: %f" % training_auc)
    print("Training Accuracy: %f" % training_acc)

    #show the model parameters used for prior, learned, slip, guess, and forget
    print(model.params())

    #predict data
    predictions = model.predict(data=student_df)
    print(predictions)

    #sort the df by descending
    sorted_predictions = predictions.sort_values(by='endTime', ascending=False)

    #update sorted predictions to the table KT Results
    result_table = "kt_results"
    print("Sorted Predictions : \n")
    print(sorted_predictions)
    try:
        sorted_predictions.to_sql(name=result_table, con=engine, if_exists='replace', index=False)
        cnx.commit()
        print("Data committed to MYSQL")

    except Exception as e:
        print(f"An error occurred : {str(e)}")
    
    finally:
        cnx.close()

    latest_predictions = sorted_predictions.groupby('skill').first()['state_predictions'].reset_index()
    sortedDF = latest_predictions.sort_values('state_predictions')
    mastery_list = []

    for index, row in sortedDF.iterrows():
        mastery_dict  = row.to_dict()
        mastery_list.append(mastery_dict)
    
    return mastery_list

   
if __name__ == "__main__":
    BKT()