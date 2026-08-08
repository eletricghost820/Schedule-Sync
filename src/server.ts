import handler, {
  createServerEntry,
} from "@tanstack/react-start/server-entry";

export default createServerEntry({
  fetch(request, ...args) {
    return handler.fetch(request, ...args);
  },
});
