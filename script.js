
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".contact-form form");
  const email = document.getElementById("email");
  const title = document.getElementById("title");
  const content = document.getElementById("content");

  const status = document.createElement("p");
  status.className = "retro";
  status.style.marginTop = "15px";
  form.appendChild(status);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const emailVal = email.value.trim();
    const titleVal = title.value.trim();
    const contentVal = content.value.trim();

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
    if (!emailOk) return show("Unesite ispravan email.", true);
    if (titleVal.length < 3) return show("Naslov mora imati bar 3 karaktera.", true);
    if (contentVal.length < 10) return show("Poruka mora imati bar 10 karaktera.", true);
    const msg = { email: emailVal, title: titleVal, content: contentVal, time: new Date().toISOString() };
    const inbox = JSON.parse(localStorage.getItem("retroInbox") || "[]");
    inbox.push(msg);
    localStorage.setItem("retroInbox", JSON.stringify(inbox));

    form.reset();
    show("Poruka je uspešno poslata! 🎮", false);
  });

  function show(text, isError) {
    status.textContent = text;
    status.style.color = isError ? "var(--zuta)" : "white";
  }
});
