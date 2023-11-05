document.getElementById("contactForm").addEventListener("submit", (e) => {
  e.preventDefault();

  let name = document.getElementById("name").value;
  let email = document.getElementById("email").value;
  let phone = document.getElementById("phone").value;
  let subject = document.getElementById("subject").value;
  let message = document.getElementById("message").value;

  if (name == "") {
    return alert("What's your name?");
  } else if (email == "") {
    return alert("Email must be filled in!");
  } else if (phone == "") {
    return alert("Phone must be charged!");
  } else if (subject == "") {
    return alert("subject must be filled in!");
  } else if (message == "") {
    return alert("Don't forget to fill in the message!");
  }

  let a = document.createElement("a");
  a.href = `mailto:${email}?subject=${subject.toUpperCase()}&body=Hello, my name is ${name}, message: ${message}. If there is a problem please call this number ${phone}, Thanks.`;
  a.click();
});