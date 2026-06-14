import { SIMULATOR_CONSTANTS, EFFICIENCY_LEVELS, ENERGY_BADGES } from '../data/simulatorRooms'

export function createInitialRoomState(rooms) {
  return rooms.reduce((acc, room) => {
    acc[room.id] = {
      configured: false,
      efficiency: 'normal',
      acHours: room.acHoursDefault,
      devices: room.devices.reduce((devices, d) => {
        devices[d.id] = { enabled: true, hours: d.hours }
        return devices
      }, {}),
    }
    return acc
  }, {})
}

export function getEfficiencyMultiplier(efficiencyId) {
  return EFFICIENCY_LEVELS.find((l) => l.id === efficiencyId)?.multiplier ?? 1
}

export function calculateRoomKwh(room, roomState) {
  const multiplier = getEfficiencyMultiplier(roomState.efficiency)
  let kwh = 0

  room.devices.forEach((device) => {
    const state = roomState.devices[device.id]
    if (!state?.enabled) return
    const hours = state.hours ?? device.hours
    kwh += (device.watts * hours * SIMULATOR_CONSTANTS.daysPerMonth) / 1000
  })

  if (roomState.acHours > 0) {
    kwh += (600 * roomState.acHours * SIMULATOR_CONSTANTS.daysPerMonth) / 1000
  }

  return kwh * multiplier
}

export function calculateHouseTotals(roomDefinitions, roomStates, upgrades = {}) {
  const { solarKw = 0, batteryKwh = 0, hasEv = false } = upgrades
  const { avgRateBmd, solarYieldPerKw, panelCostPerKw, batteryCostPerKwh, evAnnualSavings, co2PerKwh } =
    SIMULATOR_CONSTANTS

  const roomBreakdown = roomDefinitions.map((room) => {
    const state = roomStates[room.id]
    const monthlyKwh = calculateRoomKwh(room, state)
    const monthlyCost = monthlyKwh * avgRateBmd
    return { room, state, monthlyKwh, monthlyCost }
  })

  const totalMonthlyKwh = roomBreakdown.reduce((sum, r) => sum + r.monthlyKwh, 0)
  const totalMonthlyBill = totalMonthlyKwh * avgRateBmd
  const annualConsumption = totalMonthlyKwh * 12

  const annualBillBefore = totalMonthlyBill * 12

  const annualGeneration = solarKw * solarYieldPerKw
  const solarSavings = Math.min(annualGeneration * avgRateBmd, annualConsumption * avgRateBmd * 0.85)
  const batterySavings = batteryKwh * 365 * 0.15 * avgRateBmd
  const evSavings = hasEv ? evAnnualSavings : 0
  const totalAnnualSavings = solarSavings + batterySavings + evSavings

  const monthlySavings = totalAnnualSavings / 12
  const annualBillAfter = Math.max(0, annualBillBefore - totalAnnualSavings)
  const newMonthlyBill = annualBillAfter / 12
  const savingsPercent = annualBillBefore > 0 ? (totalAnnualSavings / annualBillBefore) * 100 : 0

  const solarSystemCost = solarKw * panelCostPerKw
  const batterySystemCost = batteryKwh * batteryCostPerKwh
  const systemCost = solarSystemCost + batterySystemCost
  const paybackYears = totalAnnualSavings > 0 ? systemCost / totalAnnualSavings : 0
  const lifetimeSavings20yr = totalAnnualSavings * 20 - systemCost
  const carbonReduction = (annualGeneration * co2PerKwh) / 1000 + (hasEv ? 2.4 : 0)

  const configuredCount = Object.values(roomStates).filter((s) => s.configured).length
  const efficiencyScore = Math.max(
    0,
    Math.min(
      100,
      100 - (totalMonthlyKwh - 400) / 12 + configuredCount * 2 + (solarKw > 0 ? 10 : 0) + (batteryKwh > 0 ? 5 : 0),
    ),
  )

  const badge =
    ENERGY_BADGES.find((b) => efficiencyScore >= b.min) ?? ENERGY_BADGES[ENERGY_BADGES.length - 1]

  return {
    roomBreakdown,
    totalMonthlyKwh,
    totalMonthlyBill,
    annualConsumption,
    annualBillBefore,
    annualBillAfter,
    newMonthlyBill,
    monthlySavings,
    annualGeneration,
    solarSavings,
    batterySavings,
    evSavings,
    totalAnnualSavings,
    savingsPercent,
    solarSystemCost,
    batterySystemCost,
    systemCost,
    paybackYears,
    lifetimeSavings20yr,
    carbonReduction,
    configuredCount,
    totalRooms: roomDefinitions.length,
    efficiencyScore: Math.round(efficiencyScore),
    badge,
    electricityRate: avgRateBmd,
  }
}
