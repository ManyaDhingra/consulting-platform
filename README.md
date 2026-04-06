# Consulting Insights Platform

## 🚀 Problem

Businesses often rely on manual analysis of datasets (e.g., sales, regional performance), which is time-consuming and requires domain expertise. There is a need for a system that can automatically process data, extract key metrics, and generate actionable insights in a simple and scalable way.


## 🧠 Approach

* Built a data processing pipeline using **Python (Pandas)** to clean and analyze structured datasets (CSV).
* Computed key performance indicators (KPIs) such as revenue trends, regional performance, and category-wise insights.
* Integrated **LLM-based insight generation (Mistral via OpenRouter)** to convert numerical outputs into human-readable, consultant-style insights.
* Developed a backend with structured APIs to handle data processing and insight generation.
* Designed an interactive frontend dashboard to visualize metrics and insights.


## 🔁 Iterations

* **v1:** Basic CSV processing and KPI computation.
* **v2:** Added visualization dashboard for better data interpretation.
* **v3:** Integrated LLM to generate automated insights from processed data.
* **v4:** Improved prompt engineering for more relevant and structured insights.
* **v5:** Added authentication and improved UI/UX for usability.


## ⚙️ Key Design Choices

* **Pandas for data processing** → Fast and efficient for structured data.
* **LLM integration (Mistral via OpenRouter)** → Enables natural language insights instead of raw numbers.
* **Modular backend architecture** → Separates data processing, API handling, and insight generation.
* **Interactive dashboard** → Makes insights accessible and easy to interpret.
* **Secure authentication** → Ensures controlled access to user data.


## ⏱️ Time Commitment

* Total development time: ~3–4 weeks
* Daily effort: ~2–3 hours
* Iterative improvements based on testing and output quality



## 🛠️ Tech Stack

* **Backend:** Python
* **Data Processing:** Pandas
* **LLM Integration:** OpenRouter (Mistral)
* **Frontend:** React / Next.js
* **Database:** SQLAlchemy (SQLite/MySQL)
* **Authentication:** bcrypt


## 📌 Future Improvements

* Add real-time data streaming support
* Improve insight accuracy using RAG-based pipelines
* Deploy on cloud (AWS/GCP) for scalability
* Add exportable reports (PDF/Excel)

