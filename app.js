(function () {
  var form = document.getElementById("booking-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var status = document.getElementById("form-status");
    if (status) {
      status.hidden = false;
    }

    form.reset();
  });
})();
