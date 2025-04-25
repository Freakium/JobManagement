const api = (function () {
  return {
    
    /**
     * Fetches a list of all jobs.
     * @returns Promise with array of jobs as JSON objects
     */
    fetchJobs: () => {
      return new Promise((resolve, reject) => {
        fetch(`http://localhost:3000/jobs`)
          .then(response => response.json())
          .then(jobs => {
            resolve(jobs);
          })
          .catch(response => {
            reject(response);
          });
      });
    },

    /**
     * Fetches a specific job.
     * @param {*} id The id number of the job
     * @returns Promise with job as a JSON object
     */
    fetchJob: (id) => {
      return new Promise((resolve, reject) => {
        fetch(`http://localhost:3000/jobs/${id}`)
          .then(response => response.json())
          .then(job => {
            resolve(job);
          })
          .catch(response => {
            reject(response);
          });
      });
    },

    /**
     * Add a job to the job list.
     * @param {*} id The id number of the new job
     * @param {*} customerName Name of the customer
     * @param {*} jobType The type of job
     * @param {*} status Status of the job [Scheduled, Completed, Canceled]
     * @param {*} appointmentDate The job's scheduled date in ISO format
     * @param {*} technician The name of the technician assigned to the job
     * @returns Promise with job as a JSON object
     */
    addJob: (id, customerName, jobType, status, appointmentDate, technician) => {
      return new Promise((resolve, reject) => {
        fetch(`http://localhost:3000/jobs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            id,
            customerName,
            jobType,
            status,
            appointmentDate,
            technician
          })
        })
          .then(response => response.json())
          .then(job => {
            resolve(job);
          })
          .catch(response => {
            reject(response);
          });
      });
    },

    /**
     * Update a job in the job list.
     * @param {*} id The id number of the new job
     * @param {*} customerName Name of the customer
     * @param {*} jobType The type of job
     * @param {*} status Status of the job [Scheduled, Completed, Canceled]
     * @param {*} appointmentDate The job's scheduled date in ISO format
     * @param {*} technician The name of the technician assigned to the job
     * @returns Promise with job as a JSON object
     */
    updateJob: (id, customerName, jobType, status, appointmentDate, technician) => {
      return new Promise((resolve, reject) => {
        fetch(`http://localhost:3000/jobs/${id}`, {
          method: "PUT",
          body: JSON.stringify({
            id,
            customerName,
            jobType,
            status,
            appointmentDate,
            technician
          })
        })
          .then(response => response.json())
          .then(job => {
            resolve(job);
          })
          .catch(response => {
            reject(response);
          });
      });
    },

    /**
     * Delete a job from the job list.
     * @param {*} id The id number of the job
     * @returns Promise with boolean status of the operation
     */
    deleteJob: (id) => {
      return new Promise((resolve, reject) => {
        fetch(`http://localhost:3000/jobs/${id}`, {
          method: "DELETE"
        })
          .then(response => {
            resolve(response.ok);
          })
          .catch(response => {
            reject(response);
          });
      });
    }
  }
})();