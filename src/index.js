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

  async function dbDeleteJob(id) {
    let errorMsg = 'A problem occurred while deleting job. Please try again later.';

    await api.deleteJob(id).then(
      status => {
        if(status) {
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

  /*====================== LISTENER FUNCTIONS ====================*/

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

  window.updateJobOperation = (id) => {
    dbFetchJob(id);
  }

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

  window.showDeleteModal = (event, id, name, dateTime) => {
    event.preventDefault();

    document.getElementById('deleteModal').setAttribute('data-id', id);
    document.getElementById('deleteTechnicianName').innerHTML = name;
    document.getElementById('deleteDateTime').innerHTML = dateTime;

    var modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteModal'));
    modal.show();
  }

  window.deleteJob = () => {
    let id = document.getElementById('deleteModal').getAttribute('data-id');
    dbDeleteJob(id);
  };

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
})();
