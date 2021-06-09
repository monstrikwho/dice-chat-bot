const { Router } = require("express");
const router = Router();

const MainStats = require("../models/mainstats");

router.post("/", async (req, res) => {
  const data = req.body.data;

  await MainStats.updateOne(
    {},
    {
      constRef: data.constRef,
      minGameRate: data.minGameRate,
      minIn: data.minIn,
      minOut: data.minOut,
      outPercent: data.outPercent,
      pvpPercent: data.pvpPercent,
      bonusRefPercent: data.bonusRefPercent,
      bonusRefDaughter: data.bonusRefDaughter,
      bonusRefFather: data.bonusRefFather,
      startDemoBalance: data.startDemoBalance,
      slotCoef: data.slotCoef,
      footballCoef: data.footballCoef,
      diceCoef: data.diceCoef,
    }
  );

  res.send({ status: true });
});

module.exports = router;
