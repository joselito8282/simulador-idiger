module.exports = async function (context, req) {
  context.res = { body: { ok: true, ts: Date.now(), msg: "API lista para integraciones SIRE/SAB." } }
}
