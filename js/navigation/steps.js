import { updateInstructionModal, speakInstruction } from "../ui/modals.js";
import { highlightNextStepInMap } from "../map/layers.js";
import { showNotification } from "../ui/notifications.js";

export function goToInstructionStep(stepIndex, navigationState) {
  if (
    !navigationState.instructions ||
    navigationState.instructions.length === 0
  ) {
    console.warn("goToInstructionStep: Nenhuma instrução definida.");
    return;
  }
  stepIndex = Math.max(
    0,
    Math.min(stepIndex, navigationState.instructions.length - 1)
  );
  navigationState.currentStepIndex = stepIndex;
  const step = navigationState.instructions[stepIndex];
  if (step) {
    updateInstructionModal(
      navigationState.instructions,
      stepIndex,
      navigationState.lang
    );
    speakInstruction(
      step.text,
      navigationState.lang === "pt" ? "pt-BR" : "en-US"
    );
    highlightNextStepInMap(step);
    console.log(`goToInstructionStep: Passo atualizado para ${stepIndex}.`);
  }
}

export function nextInstructionStep(navigationState) {
  if (
    navigationState.currentStepIndex <
    navigationState.instructions.length - 1
  ) {
    goToInstructionStep(navigationState.currentStepIndex + 1, navigationState);
  } else {
    console.log("nextInstructionStep: Última instrução alcançada.");
    showNotification("Você chegou ao destino final!", "success");
  }
}

export function prevInstructionStep(navigationState) {
  if (navigationState.currentStepIndex > 0) {
    goToInstructionStep(navigationState.currentStepIndex - 1, navigationState);
  } else {
    console.log("prevInstructionStep: Você já está na primeira instrução.");
  }
}
