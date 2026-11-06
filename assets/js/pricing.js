/**
 * VIRAASAT - Pricing & Bespoke Estimator Engine
 * Real-time calculation of custom tailoring, pure silk fabrics, and hand-embroidery add-ons.
 */

function calculateEstimate() {
  const silEl = document.getElementById('est-silhouette');
  const fabEl = document.getElementById('est-fabric');
  const totalEl = document.getElementById('estimated-total');

  if (!silEl || !fabEl || !totalEl) return;

  const sil = Number(silEl.value) || 0;
  const fab = Number(fabEl.value) || 0;
  let add = 0;

  const monogram = document.getElementById('add-monogram');
  const dupatta = document.getElementById('add-dupatta');
  const rush = document.getElementById('add-rush');
  const zari = document.getElementById('add-zari');

  if (monogram && monogram.checked) add += Number(monogram.value);
  if (dupatta && dupatta.checked) add += Number(dupatta.value);
  if (rush && rush.checked) add += Number(rush.value);
  if (zari && zari.checked) add += Number(zari.value);

  const total = sil + fab + add;
  totalEl.textContent = '₹' + total.toLocaleString('en-IN');
}

document.addEventListener('DOMContentLoaded', () => {
  const estForm = document.getElementById('pricing-estimator-form');
  if (estForm) {
    estForm.addEventListener('change', calculateEstimate);
    calculateEstimate();
  }
});

