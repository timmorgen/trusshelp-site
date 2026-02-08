fetch("/includes/header.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("site-header").innerHTML = html;
  });

fetch("/includes/footer.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("site-footer").innerHTML = html;
  });


