# Job Management
A job management dashboard using REST.

# Setup
- Use `npm install` to get the necessary dependencies.
- To run the project, use `npm run start`
- Open the `index.html` file in a browser.

# API Documentation
Located in `src/api.js`, this file includes functions to manipulate the `db.json` file.
- **fetchJobs()**
    - Fetches a list of all jobs.
- **fetchJob()**
    - Fetches a specific job.
- **addJob(id, customerName, jobType, status, appointmentDate, technician)**
    - Add a job to the job list.
    - Parameters:
    - id: The id number of the new job
    - customerName: Name of the customer
    - jobType: The type of job
    - status: Status of the job [Scheduled, Completed, Canceled]
    - appointmentDate: The job's scheduled date in ISO format
    - technician: The name of the technician assigned to the job
- **updateJob(id, customerName, jobType, status, appointmentDate, technician)**
    - Add a job to the job list.
    - Parameters:
    - id: The id number of the job
    - customerName: Name of the customer
    - jobType: The type of job
    - status: Status of the job [Scheduled, Completed, Canceled]
    - appointmentDate: The job's scheduled date in ISO format
    - technician: The name of the technician assigned to the job
- **deleteJob(id)**
    - Delete a job from the job list.
    - Parameters:
    - id: The id number of the job

# Explanation
I chose to use `json-server` as it is provides a lightweight and easy to use server that allows CRUD operations that saves its data to a JSON file. In other words, it is perfect for this project.

For the front-end, I chose to use native `JavaScript` because like the above choice, it's lightweight and fits the project requirements.

I chose the `Bootstrap` CSS Framework to create a responsive page and because I am most familiar with this framework.

Lastly, I included `Flatpickr` because it's my go-to date and time picker.