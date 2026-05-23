import React, { useState, useEffect } from 'react';

/* ─── CSS ─────────────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

.k-root {
  min-height: calc(100vh - 56px);
  background: #f7f6f2;
  font-family: 'Inter', sans-serif;
  color: #28251d;
}

/* ── TOP BAR ── */
.k-topbar {
  background: #fff;
  border-bottom: 1px solid #e5e3df;
  padding: 14px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 56px;
  z-index: 50;
}
.k-topbar-left { display: flex; align-items: center; gap: 12px; }
.k-lab-name {
  font-weight: 700;
  font-size: 15px;
  color: #28251d;
}
.k-lab-sub { font-size: 12px; color: #7a7974; }
.k-nfc-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #d4dfcc;
  color: #437a22;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 999px;
  letter-spacing: .03em;
}
.k-nfc-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #437a22;
  animation: kdot 1.5s ease-in-out infinite;
}
@keyframes kdot { 0%,100%{opacity:1} 50%{opacity:.3} }

/* ── STEP INDICATOR ── */
.k-steps {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0 32px;
  background: #fff;
  border-bottom: 1px solid #e5e3df;
}
.k-step {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  font-size: 12px;
  font-weight: 600;
  color: #bab9b4;
  border-bottom: 3px solid transparent;
  transition: all .2s;
  white-space: nowrap;
}
.k-step.active { color: #01696f; border-bottom-color: #01696f; }
.k-step.done   { color: #437a22; }
.k-step-num {
  width: 22px; height: 22px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700;
  background: #e5e3df;
  color: #bab9b4;
  flex-shrink: 0;
}
.k-step.active .k-step-num { background: #01696f; color: #fff; }
.k-step.done   .k-step-num { background: #437a22; color: #fff; }
.k-sep { width: 24px; height: 1px; background: #e5e3df; flex-shrink: 0; }

/* ── MAIN BODY ── */
.k-body {
  max-width: 1100px;
  margin: 0 auto;
  padding: 36px 32px 80px;
}

/* ── SECTION TITLE ── */
.k-section-title {
  font-size: 22px;
  font-weight: 700;
  color: #28251d;
  margin-bottom: 6px;
}
.k-section-sub {
  font-size: 14px;
  color: #7a7974;
  margin-bottom: 28px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ═══════════════════════════════════════
   STEP 0 — START / WELCOME
═══════════════════════════════════════ */
.k-start {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 160px);
  text-align: center;
  gap: 28px;
}
.k-start-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #cedcd8;
  color: #01696f;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 999px;
  letter-spacing: .06em;
  text-transform: uppercase;
}
.k-start h1 {
  font-size: clamp(28px, 4vw, 52px);
  font-weight: 700;
  line-height: 1.15;
  color: #28251d;
  max-width: 700px;
}
.k-start p {
  font-size: clamp(14px, 1.8vw, 18px);
  color: #7a7974;
  max-width: 500px;
  line-height: 1.7;
}
.k-start-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}
.k-start-card {
  background: #fff;
  border: 2px solid #e5e3df;
  border-radius: 16px;
  padding: 32px 28px;
  width: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: all .2s;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
}
.k-start-card:hover {
  border-color: #01696f;
  background: #f0f7f6;
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(1,105,111,.12);
}
.k-start-card-icon {
  width: 64px; height: 64px;
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  font-size: 30px;
}
.k-start-card-title { font-weight: 700; font-size: 16px; }
.k-start-card-desc  { font-size: 12px; color: #7a7974; line-height: 1.5; text-align: center; }
.k-start-card-tag {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  letter-spacing: .04em;
}

/* ═══════════════════════════════════════
   STEP 1 — FORM TYPE
═══════════════════════════════════════ */
.k-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  max-width: 640px;
}
.k-form-option {
  background: #fff;
  border: 2px solid #e5e3df;
  border-radius: 14px;
  padding: 24px;
  cursor: pointer;
  transition: all .2s;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.k-form-option:hover  { border-color: #01696f; background: #f0f7f6; }
.k-form-option.active { border-color: #01696f; background: #cedcd8; }
.k-form-icon {
  width: 44px; height: 44px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px;
}
.k-form-option-title { font-weight: 700; font-size: 16px; }
.k-form-option-desc  { font-size: 13px; color: #7a7974; line-height: 1.5; }

/* ═══════════════════════════════════════
   STEP 2 — IDENTITY
═══════════════════════════════════════ */
.k-identity-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 24px;
  align-items: center;
  max-width: 680px;
}
.k-id-card {
  background: #fff;
  border: 1.5px solid #e5e3df;
  border-radius: 14px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.k-id-label {
  font-size: 11px;
  font-weight: 700;
  color: #7a7974;
  text-transform: uppercase;
  letter-spacing: .06em;
  display: flex;
  align-items: center;
  gap: 6px;
}
.k-input {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #e5e3df;
  border-radius: 8px;
  font-size: 15px;
  font-family: 'Inter', sans-serif;
  color: #28251d;
  background: #f9f8f5;
  outline: none;
  transition: border .2s;
}
.k-input:focus { border-color: #01696f; background: #fff; box-shadow: 0 0 0 3px rgba(1,105,111,.08); }
.k-select { appearance: none; cursor: pointer; }
.k-verified {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #d4dfcc;
  border: 1.5px solid #437a22;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #437a22;
}
.k-or-divider {
  font-size: 12px;
  font-weight: 700;
  color: #bab9b4;
  letter-spacing: .08em;
  text-align: center;
}
.k-qr-box {
  background: #f9f8f5;
  border: 1.5px dashed #dcd9d5;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-height: 100px;
  color: #7a7974;
  font-size: 12px;
  cursor: pointer;
  transition: all .2s;
}
.k-qr-box:hover { border-color: #01696f; background: #f0f7f6; }

/* ═══════════════════════════════════════
   STEP 3 — TOOL SELECTION
═══════════════════════════════════════ */
.k-tool-layout {
  display: grid;
  grid-template-columns: 220px 1fr 280px;
  gap: 20px;
  align-items: start;
}
.k-sidebar {
  background: #fff;
  border: 1px solid #e5e3df;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.k-sidebar-label {
  font-size: 10px;
  font-weight: 700;
  color: #bab9b4;
  text-transform: uppercase;
  letter-spacing: .08em;
  padding: 4px 8px 10px;
}
.k-cat-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #7a7974;
  cursor: pointer;
  background: none;
  border: 1.5px solid transparent;
  transition: all .18s;
  text-align: left;
}
.k-cat-btn:hover:not(.active) { background: #f7f6f2; color: #28251d; }
.k-cat-btn.active { background: #cedcd8; color: #01696f; border-color: #01696f; }
.k-cat-count {
  margin-left: auto;
  font-size: 10px;
  font-weight: 700;
  background: #f0ede8;
  color: #7a7974;
  padding: 1px 7px;
  border-radius: 999px;
}
.k-cat-btn.active .k-cat-count { background: #01696f; color: #fff; }

.k-tool-panel {
  background: #fff;
  border: 1px solid #e5e3df;
  border-radius: 14px;
  overflow: hidden;
}
.k-tool-panel-header {
  padding: 14px 18px;
  border-bottom: 1px solid #e5e3df;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f9f8f5;
}
.k-tool-panel-title {
  font-size: 12px;
  font-weight: 700;
  color: #7a7974;
  text-transform: uppercase;
  letter-spacing: .06em;
}
.k-nfc-active {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #437a22;
}
.k-tools-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 16px;
}
.k-tool-chip {
  background: #f9f8f5;
  border: 1.5px solid #e5e3df;
  border-radius: 10px;
  padding: 12px 14px;
  cursor: pointer;
  transition: all .18s;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.k-tool-chip:hover:not(.detected) {
  border-color: #01696f;
  background: #f0f7f6;
}
.k-tool-chip.detected {
  border-color: #437a22;
  background: #d4dfcc;
  animation: kpulse .8s ease-out;
}
@keyframes kpulse {
  0%   { box-shadow: 0 0 0 0 rgba(67,122,34,.4); }
  70%  { box-shadow: 0 0 0 8px rgba(67,122,34,0); }
  100% { box-shadow: 0 0 0 0 rgba(67,122,34,0); }
}
.k-tool-check {
  position: absolute;
  top: 6px; right: 6px;
  width: 16px; height: 16px;
  background: #437a22;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 9px;
  color: #fff;
  font-weight: 900;
}
.k-tool-name { font-weight: 600; font-size: 13px; line-height: 1.3; }
.k-tool-id   { font-size: 10px; color: #bab9b4; font-variant-numeric: tabular-nums; }
.k-tool-status-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 4px;
}

/* CART PANEL */
.k-cart-panel {
  background: #fff;
  border: 1px solid #e5e3df;
  border-radius: 14px;
  overflow: hidden;
  position: sticky;
  top: 120px;
}
.k-cart-header {
  padding: 14px 18px;
  background: #f9f8f5;
  border-bottom: 1px solid #e5e3df;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.k-cart-title { font-size: 13px; font-weight: 700; color: #28251d; }
.k-cart-count {
  font-size: 11px;
  font-weight: 700;
  color: #01696f;
  background: #cedcd8;
  padding: 2px 8px;
  border-radius: 999px;
}
.k-cart-body { padding: 14px; display: flex; flex-direction: column; gap: 8px; min-height: 120px; }
.k-cart-empty { text-align: center; color: #bab9b4; font-size: 12px; padding: 24px 0; }
.k-cart-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #f9f8f5;
  border: 1px solid #e5e3df;
  border-radius: 8px;
  font-size: 12px;
  animation: fadeUp .2s ease;
}
@keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
.k-cart-item-icon {
  width: 30px; height: 30px;
  background: #f0ede8;
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}
.k-cart-item-name { font-weight: 600; flex: 1; }
.k-cart-item-id   { color: #bab9b4; font-size: 11px; }
.k-cart-remove {
  color: #a12c7b;
  font-size: 16px;
  line-height: 1;
  padding: 2px 4px;
  border-radius: 4px;
  background: none;
  border: none;
  cursor: pointer;
  transition: background .15s;
}
.k-cart-remove:hover { background: #e0ced7; }
.k-cart-footer { padding: 0 14px 14px; }

/* ═══════════════════════════════════════
   STEP 4 — RECEIPT
═══════════════════════════════════════ */
.k-receipt-layout {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 48px;
  align-items: start;
  max-width: 860px;
}
.k-receipt-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}
.k-receipt-tab {
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  border: 1.5px solid #e5e3df;
  background: #f9f8f5;
  color: #7a7974;
  cursor: pointer;
  transition: all .18s;
}
.k-receipt-tab.active {
  background: #cedcd8;
  color: #01696f;
  border-color: #01696f;
}
.k-receipt-info {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.k-receipt-summary {
  background: #f9f8f5;
  border: 1px solid #e5e3df;
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.k-receipt-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e3df;
}
.k-receipt-row:last-child { border-bottom: none; padding-bottom: 0; }
.k-receipt-lbl { color: #7a7974; }
.k-receipt-val { font-weight: 600; }

/* THERMAL RECEIPT */
.k-thermal {
  background: #fff;
  color: #111;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  line-height: 1.9;
  box-shadow: 0 4px 24px rgba(0,0,0,.12);
  width: 280px;
  flex-shrink: 0;
  position: relative;
  border-top: 4px solid #000;
}
.k-thermal::after {
  content: '';
  display: block;
  height: 10px;
  background: repeating-linear-gradient(-45deg,#fff 0,#fff 4px,transparent 4px,transparent 8px);
  position: absolute;
  bottom: -10px; left: 0; right: 0;
}
.k-thermal-top    { padding: 12px 14px 0; }
.k-thermal-center { text-align: center; margin-bottom: 8px; }
.k-thermal-logo   { font-weight: 900; font-size: 13px; letter-spacing: 2px; }
.k-thermal-sub    { font-size: 10px; letter-spacing: 1px; }
.k-thermal-hr     { border: none; border-top: 1px dashed #999; margin: 8px 0; }
.k-thermal-row    { display: flex; justify-content: space-between; gap: 8px; padding: 0 14px; }
.k-thermal-bold   { font-weight: 700; }
.k-thermal-items  { padding: 0 14px; }
.k-thermal-black  {
  background: #000; color: #fff;
  padding: 10px 14px;
  margin-top: 6px;
  font-family: 'Courier New', monospace;
  font-size: 11px;
}
.k-tb-title {
  font-weight: 900; font-size: 12px;
  letter-spacing: 1px; text-align: center;
  margin-bottom: 6px;
  border-bottom: 1px solid #555;
  padding-bottom: 4px;
}
.k-tb-row { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 4px; }
.k-tb-lbl { color: #aaa; }
.k-tb-val { color: #fff; font-weight: 700; }
.k-tb-blank { border-bottom: 1px solid #555; display: inline-block; min-width: 90px; height: 14px; }
.k-sig-row  { display: flex; gap: 16px; margin-top: 8px; padding-top: 6px; border-top: 1px solid #333; }
.k-sig-field{ flex: 1; display: flex; flex-direction: column; gap: 4px; align-items: center; }
.k-sig-lbl  { font-size: 9px; color: #aaa; letter-spacing: .08em; text-transform: uppercase; }
.k-sig-line { width: 100%; border-bottom: 1px solid #666; height: 28px; }
.k-thermal-footer { text-align: center; font-size: 10px; color: #555; line-height: 1.6; padding: 8px 14px 14px; }

/* PRINT ACTIONS */
.k-print-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 24px; }
.k-print-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 14px 24px;
  background: #01696f; color: #fff;
  font-size: 15px; font-weight: 700;
  border: none; border-radius: 10px;
  cursor: pointer; transition: all .2s;
  box-shadow: 0 2px 8px rgba(1,105,111,.2);
}
.k-print-btn:hover { background: #0c4e54; box-shadow: 0 6px 20px rgba(1,105,111,.3); transform: translateY(-1px); }
.k-new-tx-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 10px 20px;
  background: #f9f8f5; color: #7a7974;
  font-size: 13px; font-weight: 600;
  border: 1.5px solid #e5e3df; border-radius: 8px;
  cursor: pointer; transition: all .2s;
}
.k-new-tx-btn:hover { background: #f0ede8; color: #28251d; }

/* ── SHARED BUTTONS ── */
.k-btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 28px;
  background: #01696f; color: #fff;
  font-size: 15px; font-weight: 700;
  border: none; border-radius: 10px;
  cursor: pointer; transition: all .2s;
  box-shadow: 0 2px 8px rgba(1,105,111,.15);
}
.k-btn-primary:hover { background: #0c4e54; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(1,105,111,.25); }
.k-btn-secondary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 24px;
  background: #fff; color: #28251d;
  font-size: 14px; font-weight: 600;
  border: 1.5px solid #e5e3df; border-radius: 10px;
  cursor: pointer; transition: all .2s;
}
.k-btn-secondary:hover { background: #f9f8f5; border-color: #01696f; color: #01696f; }
.k-btn-row { display: flex; gap: 12px; align-items: center; margin-top: 28px; }

/* ── HINT NOTE ── */
.k-hint {
  display: inline-flex; align-items: center; gap: 6px;
  background: #f0ede8; color: #7a7974;
  font-size: 11px; padding: 5px 12px;
  border-radius: 999px; margin-top: 12px;
}

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .k-tool-layout  { grid-template-columns: 1fr; }
  .k-cart-panel   { position: static; }
  .k-receipt-layout { grid-template-columns: 1fr; }
  .k-thermal { width: 100%; max-width: 280px; }
}
@media (max-width: 640px) {
  .k-body         { padding: 24px 16px 60px; }
  .k-form-grid    { grid-template-columns: 1fr; }
  .k-identity-grid{ grid-template-columns: 1fr; }
  .k-or-divider   { display: none; }
  .k-tools-grid   { grid-template-columns: repeat(2,1fr); }
  .k-steps        { padding: 0 16px; overflow-x: auto; }
  .k-topbar       { padding: 12px 16px; }
}
`;

function injectCSS(id, css) {
  if (document.getElementById(id)) return;
  const el = document.createElement('style');
  el.id = id; el.textContent = css;
  document.head.appendChild(el);
}

/* ─── DATA ────────────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { id: 'electrical', label: 'Electrical / Power Tools', icon: '⚡', tools: [
    { id: 'DM-001', name: 'Digital Multimeter',    status: 'available' },
    { id: 'PS-002', name: 'DC Power Supply',        status: 'available' },
    { id: 'FG-003', name: 'Function Generator',     status: 'borrowed'  },
    { id: 'SI-004', name: 'Soldering Iron',          status: 'available' },
    { id: 'OC-005', name: 'Oscilloscope',            status: 'available' },
    { id: 'WS-006', name: 'Wire Stripper',           status: 'available' },
  ]},
  { id: 'cutting', label: 'Cutting Tools', icon: '✂️', tools: [
    { id: 'HS-010', name: 'Hacksaw',                status: 'available' },
    { id: 'BP-011', name: 'Box Cutter',              status: 'available' },
    { id: 'JS-012', name: 'Jigsaw',                  status: 'borrowed'  },
    { id: 'AC-013', name: 'Angle Cutter',            status: 'available' },
  ]},
  { id: 'measuring', label: 'Measuring & Inspection', icon: '📐', tools: [
    { id: 'MC-020', name: 'Micrometer',              status: 'available' },
    { id: 'VC-021', name: 'Vernier Caliper',         status: 'available' },
    { id: 'TR-022', name: 'Try Square',              status: 'available' },
    { id: 'SP-023', name: 'Spirit Level',            status: 'borrowed'  },
    { id: 'TG-024', name: 'Thickness Gauge',         status: 'available' },
  ]},
  { id: 'hand', label: 'Hand Tools', icon: '🔧', tools: [
    { id: 'TW-030', name: 'Torque Wrench',           status: 'available' },
    { id: 'RG-031', name: 'Rivet Gun',               status: 'available' },
    { id: 'SS-032', name: 'Socket Set ½″',           status: 'available' },
    { id: 'PL-033', name: 'Safety Pliers',           status: 'available' },
    { id: 'HM-034', name: 'Ball Peen Hammer',        status: 'borrowed'  },
    { id: 'SC-035', name: 'Screwdriver Set',         status: 'available' },
  ]},
  { id: 'safety', label: 'Safety & PPE', icon: '🦺', tools: [
    { id: 'GV-040', name: 'Safety Gloves (L)',       status: 'available' },
    { id: 'GG-041', name: 'Safety Goggles',          status: 'available' },
    { id: 'HH-042', name: 'Hard Hat',                status: 'available' },
    { id: 'EM-043', name: 'Ear Muffs',               status: 'available' },
    { id: 'FB-044', name: 'Face Shield',             status: 'borrowed'  },
  ]},
];

const SECTIONS = [
  { id: 'EE301-3A', label: 'EE301 — Section 3A' },
  { id: 'EE301-3B', label: 'EE301 — Section 3B' },
  { id: 'EE205-2B', label: 'EE205 — Section 2B' },
  { id: 'EE402-4A', label: 'EE402 — Section 4A' },
  { id: 'AMT-3C',   label: 'AMT   — Section 3C'  },
];

const STEPS = ['Form Type', 'Identity', 'Select Tools', 'Receipt'];

/* ─── Utility ─────────────────────────────────────────────────────────────── */
function StepBar({ current }) {
  return (
    <div className="k-steps">
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`k-step ${i === current ? 'active' : i < current ? 'done' : ''}`}>
            <div className="k-step-num">{i < current ? '✓' : i + 1}</div>
            {s}
          </div>
          {i < STEPS.length - 1 && <div className="k-sep" />}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ─── SCREEN 0: Welcome ───────────────────────────────────────────────────── */
function WelcomeScreen({ onStart }) {
  return (
    <div className="k-body">
      <div className="k-start">
        <div className="k-start-badge">📡 NFC Tool Tracking · EIL-302</div>
        <h1>Welcome to the<br />AMT Lab Tool Kiosk</h1>
        <p>Borrow or return lab tools quickly using NFC tags. Select what you need to do to get started.</p>
        <div className="k-start-actions">
          <div className="k-start-card" onClick={() => onStart('borrow')}>
            <div className="k-start-card-icon" style={{ background: '#cedcd8' }}>📥</div>
            <div className="k-start-card-title">Borrow Tools</div>
            <div className="k-start-card-desc">Scan tools you need for your lab session</div>
            <span className="k-start-card-tag" style={{ background: '#cedcd8', color: '#01696f' }}>↔ Borrow &amp; Return</span>
          </div>
          <div className="k-start-card" onClick={() => onStart('return')}>
            <div className="k-start-card-icon" style={{ background: '#ddcfc6' }}>📤</div>
            <div className="k-start-card-title">Return Tools</div>
            <div className="k-start-card-desc">Scan tools you're returning to the lab</div>
            <span className="k-start-card-tag" style={{ background: '#ddcfc6', color: '#964219' }}>↩ Return Items</span>
          </div>
          <div className="k-start-card" onClick={() => onStart('purchase')}>
            <div className="k-start-card-icon" style={{ background: '#e9e0c6' }}>🛒</div>
            <div className="k-start-card-title">Purchase Request</div>
            <div className="k-start-card-desc">Request consumables or supplies to purchase</div>
            <span className="k-start-card-tag" style={{ background: '#e9e0c6', color: '#d19900' }}>🛒 Request Only</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── STEP 1: Form Type ───────────────────────────────────────────────────── */
function StepFormType({ formType, setFormType, onNext, onBack }) {
  return (
    <div className="k-body">
      <div className="k-section-title">What do you need to do?</div>
      <div className="k-section-sub">Choose the type of transaction for this session.</div>
      <div className="k-form-grid">
        {[
          { id: 'borrow',   icon: '🔧', bg: '#cedcd8', title: 'Borrower Form', desc: 'Select and borrow tools for your lab session. Tools must be returned before leaving.', tag: '↔ Borrow & Return', tagBg: '#cedcd8', tagColor: '#01696f' },
          { id: 'purchase', icon: '🛒', bg: '#e9e0c6', title: 'Purchase Form',  desc: 'Request consumable materials or supplies that need to be purchased — items not returned.', tag: '🛒 Request to Purchase', tagBg: '#e9e0c6', tagColor: '#d19900' },
        ].map(opt => (
          <div
            key={opt.id}
            className={`k-form-option ${formType === opt.id ? 'active' : ''}`}
            onClick={() => setFormType(opt.id)}
          >
            <div className="k-form-icon" style={{ background: opt.bg }}>{opt.icon}</div>
            <div className="k-form-option-title">{opt.title}</div>
            <div className="k-form-option-desc">{opt.desc}</div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: opt.tagBg, color: opt.tagColor, marginTop: 4, display: 'inline-block' }}>{opt.tag}</span>
          </div>
        ))}
      </div>
      <div className="k-btn-row">
        <button className="k-btn-secondary" onClick={onBack}>← Back</button>
        <button className="k-btn-primary" onClick={onNext}>Continue →</button>
      </div>
    </div>
  );
}

/* ─── STEP 2: Identity ────────────────────────────────────────────────────── */
function StepIdentity({ name, setName, studentId, setStudentId, section, setSection, onNext, onBack }) {
  const verified = name.trim().length > 2 && studentId.trim().length > 4;
  return (
    <div className="k-body">
      <div className="k-section-title">Verify Your Identity</div>
      <div className="k-section-sub">Type your name manually, or scan your Student QR Code — name appears automatically.</div>
      <div className="k-identity-grid">
        {/* Manual entry */}
        <div className="k-id-card">
          <div className="k-id-label">🖥 Type Your Details</div>
          <div>
            <div style={{ fontSize: 12, color: '#7a7974', marginBottom: 6, fontWeight: 600 }}>Full Name</div>
            <input className="k-input" placeholder="e.g. Juan Dela Cruz" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#7a7974', marginBottom: 6, fontWeight: 600 }}>Student ID</div>
            <input className="k-input" placeholder="e.g. 2024-00123" value={studentId} onChange={e => setStudentId(e.target.value)} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#7a7974', marginBottom: 6, fontWeight: 600 }}>Subject / Section</div>
            <select className="k-input k-select" value={section} onChange={e => setSection(e.target.value)}>
              <option value="">Select section…</option>
              {SECTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          {verified && (
            <div className="k-verified">✓ Identity confirmed</div>
          )}
        </div>

        <div className="k-or-divider">OR</div>

        {/* QR scan */}
        <div className="k-id-card">
          <div className="k-id-label">📷 Scan Student QR Code</div>
          <div className="k-qr-box" onClick={() => { setName('Juan Dela Cruz'); setStudentId('2024-00421'); }}>
            <span style={{ fontSize: 40 }}>▣</span>
            <span>Aim camera at Student ID QR</span>
            <span style={{ fontSize: 11, color: '#bab9b4' }}>(click to simulate scan)</span>
          </div>
          {verified && (
            <div className="k-verified">✓ {name} — detected</div>
          )}
          <div className="k-hint">ℹ Name autofills from QR scan</div>
        </div>
      </div>
      <div className="k-btn-row">
        <button className="k-btn-secondary" onClick={onBack}>← Back</button>
        <button className="k-btn-primary" onClick={onNext} style={{ opacity: verified ? 1 : .5, pointerEvents: verified ? 'auto' : 'none' }}>
          Continue →
        </button>
      </div>
    </div>
  );
}


function StepTools({ cart, setCart, onNext, onBack }) {
  const [activeCat, setActiveCat] = useState('electrical');
  const cat = CATEGORIES.find(c => c.id === activeCat);

  const toggle = (tool) => {
    if (tool.status === 'borrowed') return;
    setCart(prev =>
      prev.find(t => t.id === tool.id)
        ? prev.filter(t => t.id !== tool.id)
        : [...prev, { ...tool, icon: cat.icon }]
    );
  };

  return (
    <div className="k-body">
      <div className="k-section-title">Select Tools by Category</div>
      <div className="k-section-sub">Browse categories on the left — click any tool to add it to your cart. Tap its NFC tag in real use.</div>
      <div className="k-tool-layout">

        {/* Sidebar */}
        <div className="k-sidebar">
          <div className="k-sidebar-label">Categories</div>
          {CATEGORIES.map(c => (
            <button key={c.id} className={`k-cat-btn ${activeCat === c.id ? 'active' : ''}`} onClick={() => setActiveCat(c.id)}>
              {c.icon} {c.label}
              <span className="k-cat-count">{c.tools.length}</span>
            </button>
          ))}
        </div>

        {/* Tool grid */}
        <div className="k-tool-panel">
          <div className="k-tool-panel-header">
            <span className="k-tool-panel-title">{cat.icon} {cat.label}</span>
            <span className="k-nfc-active"><span className="k-nfc-dot" />NFC Active</span>
          </div>
          <div className="k-tools-grid">
            {cat.tools.map(tool => {
              const inCart = !!cart.find(t => t.id === tool.id);
              const borrowed = tool.status === 'borrowed';
              return (
                <div
                  key={tool.id}
                  className={`k-tool-chip ${inCart ? 'detected' : ''}`}
                  onClick={() => toggle(tool)}
                  style={{ opacity: borrowed ? .45 : 1, cursor: borrowed ? 'not-allowed' : 'pointer' }}
                  title={borrowed ? 'Currently borrowed' : 'Click to add'}
                >
                  {inCart && <div className="k-tool-check">✓</div>}
                  <div className="k-tool-name">{tool.name}</div>
                  <div className="k-tool-id">#{tool.id}</div>
                  <div style={{ marginTop: 4 }}>
                    <span className="k-tool-status-dot" style={{ background: borrowed ? '#a12c7b' : '#437a22' }} />
                    <span style={{ fontSize: 10, color: borrowed ? '#a12c7b' : '#437a22', fontWeight: 600 }}>
                      {borrowed ? 'Borrowed' : 'Available'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ padding: '0 16px 14px' }}>
            <div className="k-hint">ℹ Green highlight = added to cart. Click to toggle.</div>
          </div>
        </div>

        {/* Cart */}
        <div className="k-cart-panel">
          <div className="k-cart-header">
            <span className="k-cart-title">Selected Items</span>
            <span className="k-cart-count">{cart.length} {cart.length === 1 ? 'item' : 'items'}</span>
          </div>
          <div className="k-cart-body">
            {cart.length === 0
              ? <div className="k-cart-empty">No tools selected yet</div>
              : cart.map(t => (
                  <div className="k-cart-item" key={t.id}>
                    <div className="k-cart-item-icon">{t.icon}</div>
                    <span className="k-cart-item-name">{t.name}</span>
                    <span className="k-cart-item-id">#{t.id}</span>
                    <button className="k-cart-remove" onClick={() => setCart(prev => prev.filter(x => x.id !== t.id))}>×</button>
                  </div>
                ))
            }
          </div>
          <div className="k-cart-footer">
            <button
              className="k-btn-primary"
              style={{ width: '100%', justifyContent: 'center', opacity: cart.length ? 1 : .4, pointerEvents: cart.length ? 'auto' : 'none' }}
              onClick={onNext}
            >
              Confirm & Continue →
            </button>
          </div>
        </div>
      </div>

      <div className="k-btn-row">
        <button className="k-btn-secondary" onClick={onBack}>← Back</button>
      </div>
    </div>
  );
}

/* ─── STEP 4: Receipt ─────────────────────────────────────────────────────── */
function StepReceipt({ formType, name, studentId, section, cart, onReset }) {
  const [tab, setTab] = useState(formType === 'purchase' ? 'purchase' : 'borrow');
  const [printed, setPrinted] = useState(false);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });

  const handlePrint = () => {
    setPrinted(true);
    setTimeout(() => setPrinted(false), 3000);
    // TODO: call window.print() or POST /api/receipts
  };

  return (
    <div className="k-body">
      <div className="k-section-title">Confirm &amp; Print Receipt</div>
      <div className="k-section-sub">Review your transaction — then print your receipt before leaving the kiosk.</div>

      <div className="k-receipt-tabs">
        <button className={`k-receipt-tab ${tab === 'borrow' ? 'active' : ''}`} onClick={() => setTab('borrow')}>🔧 Borrower Receipt</button>
        <button className={`k-receipt-tab ${tab === 'purchase' ? 'active' : ''}`} onClick={() => setTab('purchase')}>🛒 Purchase Receipt</button>
      </div>

      <div className="k-receipt-layout">
        {/* Summary */}
        <div>
          <div className="k-receipt-summary">
            <div className="k-receipt-row"><span className="k-receipt-lbl">Student</span><span className="k-receipt-val">{name}</span></div>
            <div className="k-receipt-row"><span className="k-receipt-lbl">Student ID</span><span className="k-receipt-val">{studentId}</span></div>
            <div className="k-receipt-row"><span className="k-receipt-lbl">Section</span><span className="k-receipt-val">{section || '—'}</span></div>
            <div className="k-receipt-row"><span className="k-receipt-lbl">Date</span><span className="k-receipt-val">{dateStr}</span></div>
            <div className="k-receipt-row"><span className="k-receipt-lbl">Time In</span><span className="k-receipt-val">{timeStr}</span></div>
            <div className="k-receipt-row" style={{ borderBottom: 'none' }}>
              <span className="k-receipt-lbl">Total Items</span>
              <span className="k-receipt-val" style={{ color: '#01696f' }}>{cart.length}</span>
            </div>
          </div>

          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cart.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: '#f9f8f5', border: '1px solid #e5e3df', borderRadius: 8, fontSize: 13 }}>
                <span style={{ fontSize: 18 }}>{t.icon}</span>
                <span style={{ fontWeight: 600, flex: 1 }}>{t.name}</span>
                <span style={{ color: '#bab9b4', fontFamily: 'monospace', fontSize: 11 }}>#{t.id}</span>
              </div>
            ))}
          </div>

          <div className="k-print-actions">
            <button className="k-print-btn" onClick={handlePrint}>
              {printed ? '✓ Receipt Printed!' : '🖨 Print Receipt'}
            </button>
            <button className="k-new-tx-btn" onClick={onReset}>↺ New Transaction</button>
          </div>
        </div>

        {/* Thermal receipt */}
        {tab === 'borrow' ? (
          <div className="k-thermal">
            <div className="k-thermal-top">
              <div className="k-thermal-center">
                <div className="k-thermal-logo">AIR LINK AMT LAB</div>
                <div className="k-thermal-sub">TOOL BORROWER RECEIPT</div>
              </div>
              <hr className="k-thermal-hr" />
              <div className="k-thermal-row"><span>Student:</span><span className="k-thermal-bold">{name}</span></div>
              <div className="k-thermal-row"><span>Student ID:</span><span className="k-thermal-bold">{studentId}</span></div>
              <div className="k-thermal-row"><span>Date:</span><span>{dateStr}</span></div>
              <div className="k-thermal-row"><span>Time In:</span><span>{timeStr}</span></div>
              <hr className="k-thermal-hr" />
              <div className="k-thermal-items">
                <div className="k-thermal-bold" style={{ marginBottom: 4 }}>TOOLS BORROWED:</div>
                {cart.map((t, i) => <div key={t.id}>{i + 1}. {t.name} #{t.id}</div>)}
              </div>
              <hr className="k-thermal-hr" />
              <div className="k-thermal-row"><span className="k-thermal-bold">Total Items:</span><span className="k-thermal-bold">{cart.length}</span></div>
            </div>
            <div className="k-thermal-black">
              <div className="k-tb-title">⬛ TIME-OUT &amp; RETURN LOG</div>
              <div className="k-tb-row"><span className="k-tb-lbl">Time Out:</span><span className="k-tb-val"><span className="k-tb-blank" /></span></div>
              <div className="k-tb-row"><span className="k-tb-lbl">All Returned:</span><span className="k-tb-val">☐ Yes &nbsp;☐ No</span></div>
              <div className="k-tb-row"><span className="k-tb-lbl">FOD Check:</span><span className="k-tb-val">☐ Cleared &nbsp;☐ Pending</span></div>
              <div className="k-sig-row">
                <div className="k-sig-field"><div className="k-sig-line" /><div className="k-sig-lbl">Borrower's Signature</div></div>
                <div className="k-sig-field"><div className="k-sig-line" /><div className="k-sig-lbl">Lab In-charge</div></div>
              </div>
            </div>
            <div className="k-thermal-footer">Return all tools before leaving.<br />FOD Check Required · CAAP AC 02-018<br />*** KEEP THIS RECEIPT ***</div>
          </div>
        ) : (
          <div className="k-thermal" style={{ borderTopColor: '#964219' }}>
            <div className="k-thermal-top">
              <div className="k-thermal-center">
                <div className="k-thermal-logo">AIR LINK AMT LAB</div>
                <div className="k-thermal-sub">PURCHASE REQUEST FORM</div>
              </div>
              <hr className="k-thermal-hr" />
              <div className="k-thermal-row"><span>Requested by:</span><span className="k-thermal-bold">{name}</span></div>
              <div className="k-thermal-row"><span>Student ID:</span><span className="k-thermal-bold">{studentId}</span></div>
              <div className="k-thermal-row"><span>Date:</span><span>{dateStr}</span></div>
              <div className="k-thermal-row"><span>Time:</span><span>{timeStr}</span></div>
              <div className="k-thermal-row"><span>Purpose:</span><span>Lab Session</span></div>
              <hr className="k-thermal-hr" />
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 14px 4px', fontSize: 9, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                <span style={{ flex: 1 }}>Item</span><span style={{ minWidth: 30, textAlign: 'center' }}>Qty</span><span style={{ minWidth: 40, textAlign: 'right' }}>Unit</span>
              </div>
              <div className="k-thermal-items">
                {cart.map(t => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                    <span style={{ flex: 1 }}>{t.name}</span><span style={{ minWidth: 30, textAlign: 'center' }}>1</span><span style={{ minWidth: 40, textAlign: 'right' }}>pc</span>
                  </div>
                ))}
              </div>
              <hr className="k-thermal-hr" />
              <div className="k-thermal-row"><span className="k-thermal-bold">Total Items:</span><span className="k-thermal-bold">{cart.length}</span></div>
            </div>
            <div className="k-thermal-black">
              <div className="k-tb-title">⬛ PURCHASE APPROVAL LOG</div>
              <div className="k-tb-row"><span className="k-tb-lbl">Date Approved:</span><span className="k-tb-val"><span className="k-tb-blank" /></span></div>
              <div className="k-tb-row"><span className="k-tb-lbl">Budget Source:</span><span className="k-tb-val"><span className="k-tb-blank" /></span></div>
              <div className="k-tb-row"><span className="k-tb-lbl">Status:</span><span className="k-tb-val">☐ Approved &nbsp;☐ Pending</span></div>
              <div className="k-sig-row">
                <div className="k-sig-field"><div className="k-sig-line" /><div className="k-sig-lbl">Requestor's Sig.</div></div>
                <div className="k-sig-field"><div className="k-sig-line" /><div className="k-sig-lbl">Lab In-charge</div></div>
              </div>
            </div>
            <div className="k-thermal-footer">Submit to department for procurement.<br />Attach supporting documents if required.<br />*** OFFICIAL PURCHASE REQUEST ***</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── ROOT COMPONENT ─────────────────────────────────────────────────────── */
export default function KioskScreen() {
  useEffect(() => { injectCSS('kiosk-css-v2', CSS); }, []);

  const [appStep, setAppStep] = useState('welcome'); // welcome | step0 | step1 | step2 | step3
  const [formType,   setFormType]   = useState('borrow');
  const [name,       setName]       = useState('');
  const [studentId,  setStudentId]  = useState('');
  const [section,    setSection]    = useState('');
  const [cart,       setCart]       = useState([]);

  const reset = () => {
    setAppStep('welcome');
    setFormType('borrow');
    setName(''); setStudentId(''); setSection('');
    setCart([]);
  };

  const handleStart = (type) => {
    setFormType(type);
    if (type === 'borrow' || type === 'purchase') setAppStep('step0');
    else setAppStep('step0');
  };

  const stepIndex = { step0: 0, step1: 1, step2: 2, step3: 3 }[appStep] ?? -1;

  return (
    <div className="k-root">
      {/* Top bar */}
      {appStep !== 'welcome' && (
        <div className="k-topbar">
          <div className="k-topbar-left">
            <div>
              <div className="k-lab-name">🔧 AMT Lab — Tool Inventory</div>
              <div className="k-lab-sub">Electronics &amp; Instrumentation Lab · EIL-302</div>
            </div>
          </div>
          <div className="k-nfc-pill"><div className="k-nfc-dot" />NFC Reader Active</div>
        </div>
      )}

      {/* Step bar */}
      {appStep !== 'welcome' && <StepBar current={stepIndex} />}

      {/* Screens */}
      {appStep === 'welcome' && <WelcomeScreen onStart={handleStart} />}

      {appStep === 'step0' && (
        <StepFormType
          formType={formType}
          setFormType={setFormType}
          onNext={() => setAppStep('step1')}
          onBack={() => setAppStep('welcome')}
        />
      )}

      {appStep === 'step1' && (
        <StepIdentity
          name={name} setName={setName}
          studentId={studentId} setStudentId={setStudentId}
          section={section} setSection={setSection}
          onNext={() => setAppStep('step2')}
          onBack={() => setAppStep('step0')}
        />
      )}

      {appStep === 'step2' && (
        <StepTools
          cart={cart} setCart={setCart}
          onNext={() => setAppStep('step3')}
          onBack={() => setAppStep('step1')}
        />
      )}

      {appStep === 'step3' && (
        <StepReceipt
          formType={formType}
          name={name} studentId={studentId} section={section}
          cart={cart}
          onReset={reset}
        />
      )}
    </div>
  );
}