import sys
import json
from difflib import SequenceMatcher
from fpdf import FPDF
from pymongo import MongoClient


def similar(a, b):
    return SequenceMatcher(None, a, b).ratio()

def find_most_similar_section(complaint, sections):
    max_similarity = 0
    most_similar_section = None

    for section in sections:
        similarity = similar(complaint, section["Offense"])
        if similarity > max_similarity:
            max_similarity = similarity
            most_similar_section = section

    return most_similar_section

def generate_fir_pdf(complainant_info, offense_info):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    pdf.cell(200, 10, txt="First Information Report (FIR)", ln=1, align="C")
    pdf.ln(10)

    pdf.multi_cell(0, 10, txt=complainant_info, align="L")
    pdf.ln(10)

    pdf.multi_cell(0, 10, txt=offense_info, align="L")

    pdf.output("public/pdfs/FIR_Report.pdf")

def main():
    # Ensure the correct number of command line arguments
    if len(sys.argv) != 2:
        print("Usage: python fir_generator.py <complaint>")
        sys.exit(1)

    complaint_id = sys.argv[1]
    print("Searching for complaint:", complaint_id)


    # Connect to MongoDB
    client = MongoClient('mongodb://localhost:27017/')
    db = client['RJPOLICE_HACK']  # Your database name
    collection = db['complains']  # Your collection name

    # Load data from a JSON file containing offense sections
    with open("csvjson.json", "r", encoding="utf-8") as file:
        data = json.load(file)

    most_similar_section = find_most_similar_section(complaint_id, data)

    if most_similar_section and most_similar_section["Cognizable"].lower() == "cognizable":
        # Retrieve complainant information from the database
        # Change the query to use _id
        complainant_data = collection.find_one({ "dis": complaint_id })

        print("Complaint Data:", complainant_data)
        if complainant_data:
            complainant_name = complainant_data["name"]
            complainant_age = complainant_data["age"]
            complainant_occupation = complainant_data["occupation"]
            complainant_city = complainant_data["city"]
            complainant_pincode = complainant_data["pin"]
            complainant_contact = complainant_data["number"]
            complainant_date = complainant_data["date"].strftime("%B %d, %Y") if complainant_data["date"] else ""
            complainant_dis = complainant_data["dis"]
            complainant_loc = complainant_data["loc"]
            complainant_details = complainant_data["detail"]
            accused_name=complainant_data["aname"]
            accused_age=complainant_data["aage"]
            accused_occupation=complainant_data["aoccupation"]
            accused_city=complainant_data["acity"]
            accused_address=complainant_data["aaddress"]


            # Update the complainant_info string with dynamic values
            complainant_info = f"""
            [Complainant Information]
            Name: {complainant_name}
            Age: {complainant_age}
            Occupation: {complainant_occupation}
            City: {complainant_city}
            Pin Code: {complainant_pincode}
            Contact Information: {complainant_contact}
            Date: {complainant_date}

            To,
            The Officer in Charge,
            {complainant_city} Police,

            Subject: {complainant_dis}

            Sir/Madam,

            [{complainant_name}], [{complainant_age}], [{complainant_occupation}], residing at [{complainant_city}], [{complainant_pincode}], contactable at [{complainant_contact}], would like to file an FIR against {accused_name}, {accused_age}, {accused_occupation}, residing at {accused_address}, {accused_city} , for the following criminal offenses committed on {complainant_date} at {complainant_loc}:

            [Description of the Offense]

            {complainant_details}


            I request the police to take immediate action against the accused and conduct a thorough investigation into the matter. I am willing to cooperate fully and provide any necessary information to assist in the investigation.

            Enclosed herewith are any supporting documents, if applicable.

            Thank you for your prompt attention to this matter.

            Yours faithfully,
            {complainant_name}
            {complainant_contact}
            """

            offense_info = f"""
            Category of: {most_similar_section["Cognizable"]}

            """

            generate_fir_pdf(complainant_info, offense_info)
            print("FIR PDF generated successfully.")

        else:
            print("Complainant data not found in the database.")
    else:
        print("No matching or non-cognizable section found.")

if __name__ == "__main__":
    main()
