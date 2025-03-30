export function updateInstructionModal(instructions, stepIndex, lang) {
  const modal = document.getElementById("instruction-modal");
  if (!modal) {
    console.warn("updateInstructionModal: Modal não encontrado.");
    return;
  }
  const instruction = instructions[stepIndex];
  modal.innerHTML = `
    <h2>${instruction.text}</h2>
    <p>${instruction.distance}m</p>
  `;
  console.log("updateInstructionModal: Modal atualizado.");
}

export function speakInstruction(text, voiceLang) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = voiceLang;
  speechSynthesis.speak(utterance);
  console.log("speakInstruction: Instrução falada.");
}
