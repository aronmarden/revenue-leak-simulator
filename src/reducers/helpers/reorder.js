export const reorderComponent = (component, sourceIndex, targetIndex) => {
  if (
    !Array.isArray(component) ||
    !Number.isInteger(sourceIndex) ||
    !Number.isInteger(targetIndex) ||
    sourceIndex === targetIndex
  )
    return component;
  const updatedComponent = [...component];
  const source = updatedComponent[sourceIndex];
  updatedComponent.splice(sourceIndex, 1);
  updatedComponent.splice(targetIndex, 0, source);
  return updatedComponent;
};
