
async function cargarFooter() {
  await cargarComponente("#footer", "footer.html");

  const fraseContenedor = document.getElementById("frase-autor");
  if (!fraseContenedor) return;

 const frases = [
  {
    frase: "La imaginación es más importante que el conocimiento.",
    autor: "Albert Einstein",
  },
  {
    frase: "El éxito es aprender a ir de fracaso en fracaso sin desesperarse.",
    autor: "Winston Churchill",
  },
  {
    frase:
      "La educación es el arma más poderosa que puedes usar para cambiar el mundo.",
    autor: "Nelson Mandela",
  },
  {
    frase: "El mayor riesgo es no correr ningún riesgo.",
    autor: "Mark Zuckerberg",
  },
  {
    frase:
      "Haz hoy lo que otros no quieren, haz mañana lo que otros no pueden.",
    autor: "Jerry Rice",
  },
  {
    frase:
      "La libertad no se implora de rodillas, se conquista en los campos de batalla.",
    autor: "José de San Martín",
  },
  {
    frase: "El arte desafía a la tecnología, y la tecnología inspira al arte.",
    autor: "John Lasseter",
  },
  {
    frase: "No tengo talentos especiales, solo soy apasionadamente curioso.",
    autor: "Albert Einstein",
  },
  { frase: "Si puedes soñarlo, puedes hacerlo.", autor: "Walt Disney" },
  {
    frase:
      "El que tiene un porqué para vivir puede soportar casi cualquier cómo.",
    autor: "Friedrich Nietzsche",
  },
];
  let indice = 0;

  function mostrarFrase() {
    fraseContenedor.classList.remove("visible");
    setTimeout(() => {
      const { frase, autor } = frases[indice];
      fraseContenedor.innerHTML = `"${frase}" — <strong>${autor}</strong>`;
      fraseContenedor.classList.add("visible");
      indice = (indice + 1) % frases.length;
    }, 1000);
  }

  mostrarFrase();
  setInterval(mostrarFrase, 6000);
}
