const api = (function () {
  return {
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