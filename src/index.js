(function () {
  let nextId = 0;

  const statusColour = {
    "Canceled": "danger",
    "Completed": "success",
    "Scheduled": "info",
  };
  const jobList = document.getElementById('job-list');

  /*========================== AUTORUN ===========================*/

  // Run job fetch on page load
  dbFetchJobs();

  // Initialize date/time picker input
  const dtp = flatpickr('.datepicker', {
    enableTime: true
  });

  /*======================= CRUD FUNCTIONS =======================*/

  /**
   * Call api to fetch list of jobs.
   */
  async function dbFetchJobs() {
    await api.fetchJobs().then(
      jobs => {
        renderJobs(jobs);
      },
      error => {
        console.error(error);
        alertMessage('messageArea', 'A problem occurred while fetching jobs. Please try again later.', 'danger');
      }
    );
  }

  /**
   * Call api to fetch a single job.
   * @param {*} id The id number of the job
   */
  async function dbFetchJob(id) {
    await api.fetchJob(id).then(
      job => {
        populateJobFields(job);
      },
      error => {
        console.error(error);
        alertMessage('messageArea', 'A problem occurred while fetching job. Please try again later.', 'danger');
      }
    );
  }

  /**
   * Call api to add a job.
   * @param {*} customerName Name of the customer
   * @param {*} jobType The type of job
   * @param {*} status Status of the job [Scheduled, Completed, Canceled]
   * @param {*} appointmentDate The job's scheduled date in ISO format
   * @param {*} technician The name of the technician assigned to the job
   */
  async function dbAddJob(customerName, jobType, status, appointmentDate, technician) {
    let id = `${nextId + 1}`;

    await api.addJob(id, customerName, jobType, status, appointmentDate, technician).then(
      job => {
        nextId++;
        createJobCard(job.id, job.customerName, job.jobType, job.status, job.appointmentDate, job.technician);
        appendAddJobButton();
        addJobOperation();
        alertMessage('messageArea', 'Job successfully added!', 'success', 3);
      },
      error => {
        console.error(error);
        alertMessage('messageArea', 'A problem occurred while adding job. Please try again later.', 'danger');
      }
    );
  }

  /**
   * Call api to update a job.
   * @param {*} id The id number of the job
   * @param {*} customerName Name of the customer
   * @param {*} jobType The type of job
   * @param {*} status Status of the job [Scheduled, Completed, Canceled]
   * @param {*} appointmentDate The job's scheduled date in ISO format
   * @param {*} technician The name of the technician assigned to the job
   */
  async function dbUpdateJob(id, customerName, jobType, status, appointmentDate, technician) {
    await api.updateJob(id, customerName, jobType, status, appointmentDate, technician).then(
      job => {
        updateJobCard(job.id, job.customerName, job.jobType, job.status, job.appointmentDate, job.technician);
        alertMessage('messageArea', 'Job successfully updated!', 'success', 3);
      },
      error => {
        console.error(error);
        alertMessage('messageArea', 'A problem occurred while updating job. Please try again later.', 'danger');
      }
    );
  }

  /**
   * Call api to delete a job.
   * @param {*} id The id number of the job
   */
  async function dbDeleteJob(id) {
    let errorMsg = 'A problem occurred while deleting job. Please try again later.';

    await api.deleteJob(id).then(
      status => {
        if (status) {
          document.getElementById(id).remove();
          addJobOperation();

          let modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
          modal.hide();

          alertMessage('messageArea', 'Job successfully deleted!', 'success', 3);
        }
        else {
          alertMessage('deleteModalMessageArea', errorMsg, 'danger');
        }
      },
      error => {
        console.error(error);
        alertMessage('deleteModalMessageArea', errorMsg, 'danger');
      }
    );
  }

  /*====================== HELPER FUNCTIONS ======================*/

  /**
   * Renders all jobs as cards with an "Add Job" button appended to the end.
   * @param {*} jobs Array of jobs as JSON objects
   */
  function renderJobs(jobs) {
    // sort by date
    jobs.sort((a, b) => {
      return new Date(b.appointmentDate) - new Date(a.appointmentDate);
    });

    jobs.forEach((job) => {
      // Make sure nextId is the highest value
      let id = parseInt(job.id);
      nextId = id > nextId ? id : nextId;

      createJobCard(job.id, job.customerName, job.jobType, job.status, job.appointmentDate, job.technician);
    });

    appendAddJobButton();
  }

  /**
   * Fill the inputs of the form with a job's information.
   * @param {*} job A single job JSON object
   */
  function populateJobFields(job) {
    document.getElementById('jobOperation').innerHTML = "Update";

    document.getElementById('jobId').value = job.id;
    document.getElementById('customerName').value = job.customerName;
    document.getElementById('jobType').value = job.jobType;
    document.getElementById('status').value = job.status;
    document.getElementById('technician').value = job.technician;

    // parse date
    let date = new Date(job.appointmentDate);
    let dateTime = date.toLocaleString();
    dtp.setDate(date);

    // show delete button
    document.getElementById('deleteJobBtn').classList.remove('d-none');
    document.getElementById('deleteJobBtn').setAttribute('onclick', `showDeleteModal(event, '${job.id}', '${job.technician}', '${dateTime}');`);

    document.getElementById('customerName').focus();
  }

  /**
   * Adds a single job card to the job list.
   * @param {*} id The id number of the new job
   * @param {*} customerName Name of the customer
   * @param {*} jobType The type of job
   * @param {*} status Status of the job [Scheduled, Completed, Canceled]
   * @param {*} appointmentDate The job's scheduled date in ISO format
   * @param {*} technician The name of the technician assigned to the job
   */
  function createJobCard(id, customerName, jobType, status, appointmentDate, technician) {
    let date = new Date(appointmentDate);
    let dateTime = date.toLocaleString();

    jobList.innerHTML +=
      `<div class="col" id="${id}">
        <div class="card shadow h-100">
          <div class="card-header d-flex bg-primary fw-bold text-white justify-content-between">
            <span class="d-flex align-items-center text-nowrap" id="${id}-technician" title="Technician">${technician}</span>
            <button class="btn btn-sm btn-info" onclick="updateJobOperation('${id}');"><i class="bi bi-pencil"></i></button>
          </div>
          <div class="card-body">
            <div class="form-floating mb-3">
              <input class="form-control mb-3" id="${id}-customerName" value="${customerName}" title="Customer Name" disabled>
              <label for="floatingInput">Customer Name</label>
            </div>
            <span class="badge bg-primary" id="${id}-jobType">${jobType}</span>
            <span class="badge bg-${statusColour[status]}" id="${id}-status">${status}</span>
          </div>
          <div class="card-footer">
            <small class="text-body-secondary" id="${id}-appointmentDate">${dateTime}</small>
          </div>
        </div>
      </div>`;
  }

  /**
   * Updates a job card in the job list with the latest information.
   * @param {*} id The id number of the new job
   * @param {*} customerName Name of the customer
   * @param {*} jobType The type of job
   * @param {*} status Status of the job [Scheduled, Completed, Canceled]
   * @param {*} appointmentDate The job's scheduled date in ISO format
   * @param {*} technician The name of the technician assigned to the job
   */
  function updateJobCard(id, customerName, jobType, status, appointmentDate, technician) {
    let date = new Date(appointmentDate);
    let dateTime = date.toLocaleString();

    document.getElementById(`${id}-customerName`).value = customerName;
    document.getElementById(`${id}-jobType`).innerHTML = jobType;
    document.getElementById(`${id}-technician`).innerHTML = technician;
    document.getElementById(`${id}-appointmentDate`).innerHTML = dateTime;

    // set status and colour
    let statusEl = document.getElementById(`${id}-status`);
    statusEl.innerHTML = status;
    statusEl.classList.remove('bg-danger', 'bg-success', 'bg-info');
    statusEl.classList.add(`bg-${statusColour[status]}`);
  }

  /**
   * Appends an 'Add Job' button to the end of the job list.
   */
  function appendAddJobButton() {
    let addBtn = document.getElementById('addJobBtn');
    if (addBtn) {
      addBtn.remove();
    }

    jobList.innerHTML +=
      `<div class="col" id="addJobBtn">
        <div class="card shadow h-100">
          <button class="btn btn-lg btn-light text-primary h-100" title="Add Job" onclick="addJobOperation();">
            <i class="bi bi-plus-square"></i>
          </button>
        </div>
      </div>`;
  }

  /*====================== DISPLAY FUNCTIONS =====================*/

  // Displays an alert message
  // @id: id of the element
  // @message: message to display
  // @colour: bootstrap colour
  // @timer: time in seconds until automatic removal
  function alertMessage(id, message, colour, timer) {
    // a message is required
    if (typeof message != 'string' || message.length == 0 || typeof id != 'string' || id.length == 0)
      return;

    let icon = colour === 'success' ? 'bi bi-check-circle' : 'bi bi-exclamation-triangle';
    let content =
      `<div class="alert alert-${colour} alert-dismissible fade show d-flex mx-auto shadow py-2" role="alert">
        <i class="${icon}"></i><span class="fw-bold mx-auto text-center">${message}</span>
        ${timer ? "" : `<button type="button" class="btn-close pt-1" data-bs-dismiss="alert" aria-label="Close"></button>`}
      </div>`;

    // display alert
    document.getElementById(id).innerHTML = content;

    // add timer
    if (timer) {
      setTimeout(() => {
        document.getElementById(id).innerHTML = "<br>";
      }, parseInt(timer) * 1000);
    }
  }

  /*====================== LISTENER FUNCTIONS ====================*/

  /**
   * Sets the form to "Add Job" mode.
   */
  window.addJobOperation = () => {
    document.getElementById('jobOperation').innerHTML = "Add";

    document.getElementById('jobId').value = "";
    document.getElementById('customerName').value = "";
    document.getElementById('jobType').value = "";
    document.getElementById('status').value = "";
    document.getElementById('technician').value = "";

    // clear datepicker
    dtp.clear();

    // hide delete button
    document.getElementById('deleteJobBtn').classList.add('d-none');
    document.getElementById('deleteJobBtn').removeAttribute('onclick');

    document.getElementById('customerName').focus();
  }

  /**
   * Sets the form to "Update Job" mode.
   * @param {*} id The id of the job
   */
  window.updateJobOperation = (id) => {
    dbFetchJob(id);
  }

  /**
   * The form's Save button listener which determines whether it's an add or update job operation.
   * @param {*} event The form's event
   * @returns Validation error message
   */
  window.addOrUpdateJob = (event) => {
    event.preventDefault();

    let id = parseInt(event.target.jobId.value);
    let customerName = event.target.customerName.value;
    let jobType = event.target.jobType.value;
    let status = event.target.status.value;
    let appointmentDate = event.target.appointmentDate.value;
    let technician = event.target.technician.value;

    // Validations
    if (!customerName) {
      alertMessage('messageArea', 'Please enter a customer name.', 'danger');
      return;
    }
    else if (!jobType) {
      alertMessage('messageArea', 'Please enter a job type.', 'danger');
      return;
    }
    else if (!status) {
      alertMessage('messageArea', 'Please select a status.', 'danger');
      return;
    }
    else if (!appointmentDate) {
      alertMessage('messageArea', 'Please select an appointment date.', 'danger');
      return;
    }
    else if (!technician) {
      alertMessage('messageArea', 'Please assign a technician.', 'danger');
      return;
    }

    // parse date
    let date = new Date(appointmentDate);
    let dateSplit = date.toISOString().split('.');
    let dateTime = dateSplit[0] + 'Z';

    id > 0
      ? dbUpdateJob(id, customerName, jobType, status, dateTime, technician)
      : dbAddJob(customerName, jobType, status, dateTime, technician);
  }

  /**
   * Display the job deletion modal.
   * @param {*} event The form's event
   * @param {*} id The id of the job
   * @param {*} name The name of the job
   * @param {*} dateTime The jobs appointment date/time
   */
  window.showDeleteModal = (event, id, name, dateTime) => {
    event.preventDefault();

    document.getElementById('deleteModal').setAttribute('data-id', id);
    document.getElementById('deleteTechnicianName').innerHTML = name;
    document.getElementById('deleteDateTime').innerHTML = dateTime;

    var modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteModal'));
    modal.show();
  }

  /**
   * Listener for the delete button in the delete job modal.
   */
  window.deleteJob = () => {
    let id = document.getElementById('deleteModal').getAttribute('data-id');
    dbDeleteJob(id);
  }
})();
