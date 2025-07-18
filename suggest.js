const openProposalBtn = document.getElementById("open-proposal-btn");
const proposalModal = document.getElementById("proposal-modal");
const closeProposalBtn = document.getElementById("close-proposal");
const cancelProposalBtn = document.getElementById("cancel-proposal-btn");
const applyProposalBtn = document.getElementById("apply-proposal-btn");
const proposalListEl = document.getElementById("proposal-list");
const modalMonthName = document.getElementById("modal-month-name");

// Función para calcular propuesta de gasto para el mes actual (currentMonthIndex)
function calcularPropuestaGasto() {
  if (!uniBudgetData) return {};

  // Presupuesto mensual para distribuir
  const presupuestoMensual = uniBudgetData.total / uniBudgetData.meses;

  // Aquí puedes usar ponderaciones o reglas para distribuir el gasto
  // Ejemplo simple: repartir proporcionalmente según un peso básico
  const pesos = {
    "Alquiler": 30,
    "Transporte": 10,
    "Ocio": 15,
    "Materiales": 10,
    "Alimentación": 25,
    "Otros": 10,
  };

  // Añadir categorías personalizadas con peso estándar, ejemplo 5
  customCategories.forEach(cat => {
    pesos[cat] = 5;
  });

  // Calcular suma de pesos
  const sumaPesos = Object.values(pesos).reduce((a,b) => a + b, 0);

  // Calcular propuesta con dos decimales
  const propuesta = {};
  for (const cat of getAllCategories()) {
    const pesoCat = pesos[cat] || 5; // peso por defecto 5
    propuesta[cat] = +(presupuestoMensual * pesoCat / sumaPesos).toFixed(2);
  }

  return propuesta;
}

// Función para mostrar modal y rellenar lista
function mostrarModalPropuesta() {
  if (!uniBudgetData) return;

  modalMonthName.textContent = monthNameEl.textContent;

  const propuesta = calcularPropuestaGasto();

  proposalListEl.innerHTML = "";

  for (const [cat, val] of Object.entries(propuesta)) {
    const div = document.createElement("div");
    div.textContent = `${cat}: ${formatEuro(val)}`;
    proposalListEl.appendChild(div);
  }

  proposalModal.classList.remove("hidden");
}

// Abrir modal
openProposalBtn.addEventListener("click", mostrarModalPropuesta);

// Cerrar modal
closeProposalBtn.addEventListener("click", () => proposalModal.classList.add("hidden"));
cancelProposalBtn.addEventListener("click", () => proposalModal.classList.add("hidden"));

// Aplicar propuesta: asignar valores a inputs y guardar
applyProposalBtn.addEventListener("click", () => {
  const propuesta = calcularPropuestaGasto();

  for (const [cat, val] of Object.entries(propuesta)) {
    const input = document.getElementById(`category-${cat}`);
    if (input) {
      input.value = val.toFixed(2);
      uniBudgetData.gastos[currentMonthIndex][cat] = val;
    }
  }

  saveData();
  actualizarResumen();
  mostrarDiferenciaMes(currentMonthIndex);
  proposalModal.classList.add("hidden");
});
