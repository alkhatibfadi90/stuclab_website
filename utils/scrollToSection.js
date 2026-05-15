export function scrollToSection(sectionId, onSuccess) {
  const target = document.getElementById(sectionId);

  if (!target) {
    return;
  }

  target.scrollIntoView({ behavior: 'smooth', block: 'start' });

  if (typeof onSuccess === 'function') {
    onSuccess();
  }
}
