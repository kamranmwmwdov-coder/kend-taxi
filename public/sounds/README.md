# Notification sound assets

The sound manager maps notification events to these optional public audio files:

- `new-order.wav`
- `driver-selected.wav`
- `driver-confirmed.wav`
- `driver-arriving.wav`
- `order-cancelled.wav`
- `order-completed.wav`
- `system.wav`

When a file is not supplied or fails to load, the app uses a short built-in Web Audio tone after the user has enabled sound. Missing paths are cached for the lifetime of the page, so they are not requested repeatedly.
