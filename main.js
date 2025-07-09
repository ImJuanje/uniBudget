// =====================
// Elementos DOM
// =====================
const saveBtn = document.getElementById("save-setup");
const initialInput = document.getElementById("initial-income");
const monthsInput = document.getElementById("months");
const startMonthSelect = document.getElementById("start-month");

const totalEl = document.getElementById("total");
const mesesEl = document.getElementById("meses");
const presupuestoEl = document.getElementById("presupuesto");
const gastoAcumuladoEl = document.getElementById("gasto-acumulado");
const saldoRestanteEl = document.getElementById("saldo-restante");

const summarySection = document.getElementById("summary");
const setupSection = document.getElementById("setup");
const monthViewSection = document.getElementById("month-view");

const monthNameEl = document.getElementById("month-name");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");

const monthDifferenceEl = document.getElementById("month-difference");
const categoriesForm = document.getElementById("categories-form");

const addCategoryForm = document.getElementById("add-category-form");
const newCategoryInput = document.getElementById("new-category-name");
const categoriesList = document.getElementById("categories-list");

const addIncomeBtn = document.getElementById("add-income-btn");
const extraIncomeDialog = document.getElementById("extra-income-dialog");
const extraIncomeAmount = document.getElementById("extra-income-amount");
const extraIncomeMonth = document.getElementById("extra-income-month");
const confirmExtraIncomeBtn = document.getElementById("confirm-extra-income");
const cancelExtraIncomeBtn = document.getElementById("cancel-extra-income");

// =====================
// Variables
// =====================
const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const fixedCategories = ["Alquiler", "Transporte", "Ocio", "Materiales", "Alimentación", "Otros"];
let customCategories = [];
let uniBudgetData = null;
let currentMonthIndex = 0;

// =====================
// Utilidades
// =====================
const formatEuro = num => `${num.toFixed(2)} €`;

const getAllCategories = () => [...fixedCategories, ...customCategories];

// =====================
// LocalStorage
// =====================
function saveData() {
  localStorage.setItem("uniBudgetData", JSON.stringify(uniBudgetData));
  localStorage.setItem("customCategories", JSON.stringify(customCategories));
}

function loadData() {
  const data = localStorage.getItem("uniBudgetData");
  const custom = localStorage.getItem("customCategories");
  uniBudgetData = data ? JSON.parse(data) : null;
  customCategories = custom ? JSON.parse(custom) : [];
}

// =====================
// Inicialización gastos
// =====================
function initGastos(meses) {
  return Array.from({ length: meses }, () => {
    const obj = {};
    getAllCategories().forEach(cat => obj[cat] = 0);
    return obj;
  });
}

// =====================
// Resumen general
// =====================
function gastoAcumulado() {
  if (!uniBudgetData) return 0;
  return uniBudgetData.gastos.reduce((acc, mes) =>
    acc + getAllCategories().reduce((suma, cat) => suma + (mes[cat] || 0), 0)
  , 0);
}

function actualizarResumen() {
  if (!uniBudgetData) return;
  const { total, meses } = uniBudgetData;
  const presupuesto = total / meses;
  const gastado = gastoAcumulado();
  const saldo = total - gastado;

  totalEl.textContent = formatEuro(total);
  mesesEl.textContent = meses;
  presupuestoEl.textContent = formatEuro(presupuesto);
  gastoAcumuladoEl.textContent = formatEuro(gastado);
  saldoRestanteEl.textContent = formatEuro(saldo);
}

function gastoMes(index) {
  if (!uniBudgetData) return 0;
  return getAllCategories().reduce((suma, cat) =>
    suma + (uniBudgetData.gastos[index][cat] || 0), 0);
}

function mostrarDiferenciaMes(index) {
  if (!uniBudgetData) return;
  const presupuestoMensual = uniBudgetData.total / uniBudgetData.meses;
  const gasto = gastoMes(index);
  const diferencia = presupuestoMensual - gasto;

  monthDifferenceEl.textContent = `${diferencia >= 0 ? "+" : "-"}${formatEuro(Math.abs(diferencia))}`;
  monthDifferenceEl.classList.toggle("negativo", diferencia < 0);
}

// =====================
// Render inputs por categoría
// =====================
function renderCategoryInputs() {
  categoriesForm.innerHTML = "";
  getAllCategories().forEach(cat => {
    const label = document.createElement("label");
    label.setAttribute("for", `category-${cat}`);
    label.textContent = cat;

    const input = document.createElement("input");
    input.type = "number";
    input.id = `category-${cat}`;
    input.min = "0";
    input.step = "0.01";
    input.value = "0.00";

    input.addEventListener("input", e => {
      let val = parseFloat(e.target.value);
      if (isNaN(val) || val < 0) val = 0;
      uniBudgetData.gastos[currentMonthIndex][cat] = val;
      saveData();
      actualizarResumen();
      mostrarDiferenciaMes(currentMonthIndex);
    });

    categoriesForm.appendChild(label);
    categoriesForm.appendChild(input);
  });
}

// =====================
// Mostrar mes
// =====================
function mostrarMes(index) {
  if (!uniBudgetData) return;
  const { meses, startMonth, gastos } = uniBudgetData;
  if (index < 0 || index >= meses) return;

  currentMonthIndex = index;
  const realMonth = (startMonth + index) % 12;
  monthNameEl.textContent = monthNames[realMonth];

  getAllCategories().forEach(cat => {
    const input = document.getElementById(`category-${cat}`);
    if (input) input.value = (gastos[index][cat] ?? 0).toFixed(2);
  });

  mostrarDiferenciaMes(index);
}

// =====================
// Categorías personalizadas
// =====================
function renderCategoriesList() {
  categoriesList.innerHTML = "";
  getAllCategories().forEach(cat => {
    const li = document.createElement("li");
    li.textContent = cat;

    if (!fixedCategories.includes(cat)) {
      const btn = document.createElement("button");
      btn.textContent = "Eliminar";
      btn.style.marginLeft = "0.8rem";
      btn.addEventListener("click", () => eliminarCategoria(cat));
      li.appendChild(btn);
    }

    categoriesList.appendChild(li);
  });
}

function eliminarCategoria(cat) {
  customCategories = customCategories.filter(c => c !== cat);
  if (uniBudgetData) {
    uniBudgetData.gastos.forEach(mes => delete mes[cat]);
    saveData();
  }
  renderCategoryInputs();
  renderCategoriesList();
  mostrarMes(currentMonthIndex);
  actualizarResumen();
}

// =====================
// Guardar configuración inicial
// =====================
saveBtn.addEventListener("click", () => {
  const total = parseFloat(initialInput.value);
  const meses = parseInt(monthsInput.value);
  const startMonth = parseInt(startMonthSelect.value);

  if (isNaN(total) || isNaN(meses) || total <= 0 || meses <= 0) {
    alert("Por favor, introduce valores válidos.");
    return;
  }

  uniBudgetData = {
    total,
    meses,
    startMonth,
    gastos: initGastos(meses),
    ingresosExtra: Array(meses).fill(0) // inicializa ingresos extra
  };

  saveData();

  setupSection.classList.add("hidden");
  summarySection.classList.remove("hidden");
  monthViewSection.classList.remove("hidden");

  renderCategoryInputs();
  renderCategoriesList();
  actualizarResumen();
  mostrarMes(0);
});

// =====================
// Navegación
// =====================
prevMonthBtn.addEventListener("click", () => mostrarMes(currentMonthIndex - 1));
nextMonthBtn.addEventListener("click", () => mostrarMes(currentMonthIndex + 1));

// =====================
// Añadir categoría personalizada
// =====================
addCategoryForm.addEventListener("submit", e => {
  e.preventDefault();
  const nuevaCat = newCategoryInput.value.trim();
  if (!nuevaCat) return alert("Escribe un nombre válido.");
  if (getAllCategories().includes(nuevaCat)) return alert("Esa categoría ya existe.");

  customCategories.push(nuevaCat);
  if (uniBudgetData) {
    uniBudgetData.gastos.forEach(mes => mes[nuevaCat] = 0);
    saveData();
  }

  newCategoryInput.value = "";
  renderCategoryInputs();
  renderCategoriesList();
  mostrarMes(currentMonthIndex);
});

// =====================
// Inicio
// =====================
window.addEventListener("DOMContentLoaded", () => {
  loadData();

  if (uniBudgetData) {
    setupSection.classList.add("hidden");
    summarySection.classList.remove("hidden");
    monthViewSection.classList.remove("hidden");

    renderCategoryInputs();
    renderCategoriesList();
    actualizarResumen();
    mostrarMes(0);
  }
});

// =====================
// Ingresos extra - Modal
// =====================

// Mostrar modal y rellenar select con meses disponibles
addIncomeBtn.addEventListener("click", () => {
  if (!uniBudgetData) {
    alert("Primero configura tu presupuesto.");
    return;
  }

  extraIncomeAmount.value = "";
  extraIncomeMonth.innerHTML = "";

  const { meses, startMonth } = uniBudgetData;
  for (let i = 0; i < meses; i++) {
    const mesIndex = (startMonth + i) % 12;
    const option = document.createElement("option");
    option.value = i;
    option.textContent = monthNames[mesIndex];
    extraIncomeMonth.appendChild(option);
  }

  extraIncomeDialog.classList.remove("hidden");
});

// Cancelar modal
cancelExtraIncomeBtn.addEventListener("click", () => {
  extraIncomeDialog.classList.add("hidden");
});

// Confirmar ingreso extra
confirmExtraIncomeBtn.addEventListener("click", () => {
  const val = parseFloat(extraIncomeAmount.value);
  if (isNaN(val) || val <= 0) {
    alert("Introduce un importe válido mayor que 0.");
    return;
  }

  const mesSeleccionado = parseInt(extraIncomeMonth.value);
  if (isNaN(mesSeleccionado)) {
    alert("Selecciona un mes válido.");
    return;
  }

  if (!uniBudgetData.ingresosExtra) {
    uniBudgetData.ingresosExtra = Array(uniBudgetData.meses).fill(0);
  }

  uniBudgetData.ingresosExtra[mesSeleccionado] += val;
  uniBudgetData.total += val;

  saveData();
  actualizarResumen();
  mostrarMes(currentMonthIndex);

  extraIncomeDialog.classList.add("hidden");
});
