import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HOUSE_ROOMS,
  EFFICIENCY_LEVELS,
  SIMULATOR_CONSTANTS,
} from '../../data/simulatorRooms'
import {
  createInitialRoomState,
  calculateHouseTotals,
  calculateRoomKwh,
} from '../../utils/simulatorCalculations'
import { formatCurrency, formatNumber } from '../../utils/format'
import Button from '../ui/Button'
import { ROUTES } from '../../constants/routes'

const GRID_LAYOUT = `
  "garage kitchen dining"
  "living living office"
  "master bed2 bed3"
  "laundry bath patio"
`

function CostSavingsPanel({ totals, compact = false }) {
  const hasUpgrades = totals.totalAnnualSavings > 0

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-white/10 px-3 py-2 text-center">
          <p className="text-caption uppercase text-slate-300">Current bill</p>
          <p className="text-sm font-bold">{formatCurrency(totals.totalMonthlyBill)}/mo</p>
        </div>
        <div className="rounded-lg bg-white/10 px-3 py-2 text-center">
          <p className="text-caption uppercase text-slate-300">After upgrades</p>
          <p className="text-sm font-bold text-green-300">{formatCurrency(totals.newMonthlyBill)}/mo</p>
        </div>
        <div className="rounded-lg bg-green-500/20 px-3 py-2 text-center">
          <p className="text-caption uppercase text-green-200">You save</p>
          <p className="text-sm font-bold text-green-300">{formatCurrency(totals.monthlySavings)}/mo</p>
        </div>
        <div className="rounded-lg bg-gold-500/20 px-3 py-2 text-center">
          <p className="text-caption uppercase text-gold-200">Annual savings</p>
          <p className="text-sm font-bold text-gold-300">{formatCurrency(totals.totalAnnualSavings)}/yr</p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-teal-200 bg-gradient-to-br from-white to-teal-50 card-padding card-shadow">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-navy-900">💵 Your Electricity Costs</h3>
          <p className="mt-1 text-sm text-slate-600">
            Bermuda rate: {formatNumber(totals.electricityRate, { style: 'currency', currency: 'BMD', minimumFractionDigits: 2 })} per kWh
          </p>
        </div>
        {hasUpgrades && (
          <span className="rounded-full bg-green-100 px-4 py-1.5 text-sm font-bold text-green-700">
            ↓ {totals.savingsPercent.toFixed(0)}% cost reduction
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Before (current)</p>
          <p className="mt-2 text-h1 font-bold text-red-600">{formatCurrency(totals.totalMonthlyBill)}</p>
          <p className="text-xs text-slate-500">per month · {formatCurrency(totals.annualBillBefore)}/year</p>
        </div>
        <div className="flex items-center justify-center">
          <div className="text-center">
            <span className="text-4xl" aria-hidden="true">→</span>
            {hasUpgrades && (
              <p className="mt-1 text-sm font-bold text-green-600">
                Save {formatCurrency(totals.monthlySavings)}/mo
              </p>
            )}
          </div>
        </div>
        <div className="rounded-xl border-2 border-green-300 bg-green-50 p-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-green-700">After upgrades</p>
          <p className="mt-2 text-h1 font-bold text-green-700">{formatCurrency(totals.newMonthlyBill)}</p>
          <p className="text-xs text-green-600">per month · {formatCurrency(totals.annualBillAfter)}/year</p>
        </div>
      </div>

      {hasUpgrades && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {totals.solarSavings > 0 && (
            <div className="rounded-lg bg-amber-50 px-4 py-3">
              <p className="text-xs text-amber-700">☀️ Solar savings</p>
              <p className="font-bold text-amber-900">{formatCurrency(totals.solarSavings)}/yr</p>
            </div>
          )}
          {totals.batterySavings > 0 && (
            <div className="rounded-lg bg-blue-50 px-4 py-3">
              <p className="text-xs text-blue-700">🔋 Battery savings</p>
              <p className="font-bold text-blue-900">{formatCurrency(totals.batterySavings)}/yr</p>
            </div>
          )}
          {totals.evSavings > 0 && (
            <div className="rounded-lg bg-violet-50 px-4 py-3">
              <p className="text-xs text-violet-700">🚗 EV savings</p>
              <p className="font-bold text-violet-900">{formatCurrency(totals.evSavings)}/yr</p>
            </div>
          )}
        </div>
      )}

      {(totals.solarSystemCost > 0 || totals.batterySystemCost > 0) && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-navy-900">Equipment investment</p>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {totals.solarSystemCost > 0 && (
              <div className="flex justify-between">
                <dt className="text-slate-600">Solar system ({totals.annualGeneration > 0 ? `${formatNumber(totals.annualGeneration / SIMULATOR_CONSTANTS.solarYieldPerKw, { maximumFractionDigits: 1 })} kW` : ''})</dt>
                <dd className="font-semibold text-navy-900">{formatCurrency(totals.solarSystemCost)}</dd>
              </div>
            )}
            {totals.batterySystemCost > 0 && (
              <div className="flex justify-between">
                <dt className="text-slate-600">Battery storage</dt>
                <dd className="font-semibold text-navy-900">{formatCurrency(totals.batterySystemCost)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-200 pt-2 sm:col-span-2">
              <dt className="font-medium text-navy-900">Total system cost</dt>
              <dd className="font-bold text-navy-900">{formatCurrency(totals.systemCost)}</dd>
            </div>
            <div className="flex justify-between sm:col-span-2">
              <dt className="text-slate-600">Payback period</dt>
              <dd className="font-semibold text-teal-700">{totals.paybackYears.toFixed(1)} years</dd>
            </div>
            <div className="flex justify-between sm:col-span-2">
              <dt className="text-slate-600">20-year net savings (after equipment)</dt>
              <dd className={`font-bold ${totals.lifetimeSavings20yr >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                {formatCurrency(totals.lifetimeSavings20yr)}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  )
}

function RoomTile({ room, state, isActive, monthlyKwh, monthlyCost, onSelect }) {
  const level = EFFICIENCY_LEVELS.find((l) => l.id === state.efficiency)
  const usage = monthlyKwh > 120 ? 'high' : monthlyKwh > 60 ? 'mid' : 'low'

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(room.id)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative flex min-h-[100px] flex-col items-center justify-center rounded-xl border-2 p-3 text-center transition-shadow
        ${isActive ? 'border-gold-400 ring-2 ring-gold-400/50 shadow-lg' : 'border-white/20 hover:border-white/40'}
        bg-gradient-to-br ${room.color} text-white
      `}
      style={{ gridArea: room.gridArea }}
      aria-pressed={isActive}
      aria-label={`${room.name}, ${formatNumber(monthlyKwh, { maximumFractionDigits: 0 })} kWh per month`}
    >
      {state.configured && (
        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs text-green-600" aria-hidden="true">
          ✓
        </span>
      )}
      <span className="text-2xl md:text-3xl" aria-hidden="true">{room.emoji}</span>
      <span className="mt-1 text-xs font-bold leading-tight md:text-sm">{room.name}</span>
      <span className="mt-1 rounded-full bg-black/20 px-2 py-0.5 text-caption font-medium">
        {formatCurrency(monthlyCost)}/mo
      </span>
      <span className="text-caption opacity-75">
        {formatNumber(monthlyKwh, { maximumFractionDigits: 0 })} kWh
      </span>
      <span
        className={`mt-1 h-1.5 w-10 rounded-full ${
          usage === 'low' ? 'bg-green-300' : usage === 'mid' ? 'bg-amber-300' : 'bg-red-300'
        }`}
        aria-hidden="true"
      />
      {level && (
        <span className="mt-1 text-caption opacity-80">{level.emoji} {level.label}</span>
      )}
    </motion.button>
  )
}

function RoomPanel({ room, state, monthlyKwh, monthlyCost, onUpdate, onClose }) {
  if (!room) return null

  const update = (patch) => onUpdate(room.id, patch)
  const updateDevice = (deviceId, patch) =>
    onUpdate(room.id, {
      devices: { ...state.devices, [deviceId]: { ...state.devices[deviceId], ...patch } },
    })

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="rounded-2xl border border-slate-200 bg-white card-padding card-shadow"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <span className="text-3xl" aria-hidden="true">{room.emoji}</span>
          <h3 className="mt-1 text-xl font-bold text-navy-900">{room.name}</h3>
          <p className="mt-1 text-sm text-slate-600">{room.description}</p>
          <div className="mt-3 inline-flex gap-3 rounded-lg bg-teal-50 px-3 py-2 text-sm">
            <span><strong className="text-navy-900">{formatCurrency(monthlyCost)}</strong><span className="text-slate-500">/month</span></span>
            <span className="text-slate-300">|</span>
            <span><strong className="text-navy-900">{formatNumber(monthlyKwh, { maximumFractionDigits: 0 })}</strong><span className="text-slate-500"> kWh</span></span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close room panel"
        >
          ✕
        </button>
      </div>

      <div className="mb-5">
        <p className="mb-2 text-sm font-medium text-slate-700">Usage level</p>
        <div className="flex flex-wrap gap-2">
          {EFFICIENCY_LEVELS.map((level) => (
            <button
              key={level.id}
              type="button"
              onClick={() => update({ efficiency: level.id, configured: true })}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                state.efficiency === level.id
                  ? level.color + ' ring-2 ring-offset-1 ring-teal-400'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-teal-300'
              }`}
            >
              {level.emoji} {level.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <label htmlFor={`ac-${room.id}`} className="mb-2 block text-sm font-medium text-slate-700">
          AC / cooling hours per day: <strong>{state.acHours}h</strong>
        </label>
        <input
          id={`ac-${room.id}`}
          type="range"
          min={0}
          max={12}
          step={1}
          value={state.acHours}
          onChange={(e) => update({ acHours: Number(e.target.value), configured: true })}
          className="w-full accent-teal-600"
        />
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-slate-700">Appliances in this room</p>
        <ul className="space-y-3">
          {room.devices.map((device) => {
            const ds = state.devices[device.id]
            return (
              <li key={device.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={ds?.enabled ?? true}
                    onChange={(e) => updateDevice(device.id, { enabled: e.target.checked })}
                    className="h-4 w-4 rounded accent-teal-600"
                  />
                  <span className="flex-1 text-sm font-medium text-navy-900">{device.name}</span>
                  <span className="text-xs text-slate-500">{device.watts}W</span>
                </label>
                {ds?.enabled && (
                  <div className="mt-2 pl-7">
                    <label className="text-xs text-slate-500">
                      Hours/day: {ds.hours}
                      <input
                        type="range"
                        min={0}
                        max={24}
                        step={0.5}
                        value={ds.hours}
                        onChange={(e) => updateDevice(device.id, { hours: Number(e.target.value) })}
                        className="mt-1 w-full accent-teal-600"
                      />
                    </label>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      <Button
        variant="primary"
        className="mt-5 w-full"
        onClick={() => update({ configured: true })}
      >
        Save {room.name} ✓
      </Button>
    </motion.div>
  )
}

export default function HouseEnergyGame() {
  const [roomStates, setRoomStates] = useState(() => createInitialRoomState(HOUSE_ROOMS))
  const [activeRoomId, setActiveRoomId] = useState(null)
  const [solarKw, setSolarKw] = useState(6)
  const [batteryKwh, setBatteryKwh] = useState(0)
  const [hasEv, setHasEv] = useState(false)
  const [step, setStep] = useState(1)

  const activeRoom = HOUSE_ROOMS.find((r) => r.id === activeRoomId)

  const totals = useMemo(
    () => calculateHouseTotals(HOUSE_ROOMS, roomStates, { solarKw, batteryKwh, hasEv }),
    [roomStates, solarKw, batteryKwh, hasEv],
  )

  const progress = Math.round((totals.configuredCount / totals.totalRooms) * 100)

  const updateRoom = (roomId, patch) => {
    setRoomStates((prev) => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        ...patch,
        devices: patch.devices ? { ...prev[roomId].devices, ...patch.devices } : prev[roomId].devices,
      },
    }))
  }

  return (
    <div className="space-y-4">
      {/* Game header */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-navy-900 via-[#2E5496] to-teal-800 card-padding text-white md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">Energy Quest</p>
            <h2 className="mt-1 text-h2 font-bold md:text-3xl">Build & Power Your Bermuda Home</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-200">
              Tap each room to set appliances and usage. Complete all {totals.totalRooms} rooms to unlock your full energy score!
            </p>
          </div>
          <div className={`rounded-xl bg-gradient-to-br ${totals.badge.color} px-5 py-4 text-center shadow-lg`}>
            <span className="text-3xl" aria-hidden="true">{totals.badge.emoji}</span>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-white/80">Your rank</p>
            <p className="font-semibold">{totals.badge.label}</p>
            <p className="text-h2 font-bold">{totals.efficiencyScore}/100</p>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex justify-between text-xs text-slate-300">
            <span>Home exploration: {totals.configuredCount}/{totals.totalRooms} rooms</span>
            <span>{progress}% complete</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-gold-400 to-teal-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="mt-5">
          <CostSavingsPanel totals={totals} compact />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStep(s)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                step === s ? 'bg-white text-navy-900' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {s === 1 && '🏠 Explore Rooms'}
              {s === 2 && '☀️ Add Solar & Battery'}
              {s === 3 && '📊 Results'}
            </button>
          ))}
        </div>
      </div>

      <CostSavingsPanel totals={totals} />

      {step === 1 && (
        <div className="grid gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-navy-900">Your House Floor Plan</h3>
              <span className="text-sm text-slate-500">Click a room to configure</span>
            </div>
            <div
              className="grid gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-100 to-slate-200 p-3 md:gap-3 md:p-4"
              style={{ gridTemplateAreas: GRID_LAYOUT, gridTemplateColumns: 'repeat(3, 1fr)' }}
            >
              {HOUSE_ROOMS.map((room) => {
                const kwh = calculateRoomKwh(room, roomStates[room.id])
                return (
                  <RoomTile
                    key={room.id}
                    room={room}
                    state={roomStates[room.id]}
                    isActive={activeRoomId === room.id}
                    monthlyKwh={kwh}
                    monthlyCost={kwh * SIMULATOR_CONSTANTS.avgRateBmd}
                    onSelect={setActiveRoomId}
                  />
                )
              })}
            </div>
            <p className="mt-3 text-center text-xs text-slate-500">
              🟢 Low use · 🟡 Medium · 🔴 High — based on monthly kWh per room
            </p>
          </div>

          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {activeRoom ? (
                <RoomPanel
                  key={activeRoom.id}
                  room={activeRoom}
                  state={roomStates[activeRoom.id]}
                  monthlyKwh={calculateRoomKwh(activeRoom, roomStates[activeRoom.id])}
                  monthlyCost={calculateRoomKwh(activeRoom, roomStates[activeRoom.id]) * SIMULATOR_CONSTANTS.avgRateBmd}
                  onUpdate={updateRoom}
                  onClose={() => setActiveRoomId(null)}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-teal-200 bg-teal-50/50 p-8 text-center"
                >
                  <span className="text-5xl" aria-hidden="true">👆</span>
                  <p className="mt-4 font-semibold text-navy-900">Select a room to play</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Choose any room on the floor plan to adjust appliances, AC hours, and usage level.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white card-padding card-shadow">
            <h3 className="font-semibold text-navy-900">☀️ Solar & Battery Upgrades</h3>
            <p className="mt-2 text-sm text-slate-600">Power-up your home! Add renewable upgrades to boost your score.</p>
            <div className="mt-4 space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="solarKw" className="text-sm font-medium text-slate-700">
                    Solar panels: <strong>{solarKw} kW</strong>
                  </label>
                  <span className="text-sm font-bold text-navy-900">
                    {formatCurrency(totals.solarSystemCost)}
                  </span>
                </div>
                <input
                  id="solarKw"
                  type="range"
                  min={0}
                  max={20}
                  step={0.5}
                  value={solarKw}
                  onChange={(e) => setSolarKw(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
                {solarKw > 0 && (
                  <p className="mt-1 text-xs text-green-600">
                    Saves ~{formatCurrency(totals.solarSavings)}/year on electricity
                  </p>
                )}
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="batteryKwh" className="text-sm font-medium text-slate-700">
                    Battery storage: <strong>{batteryKwh} kWh</strong>
                  </label>
                  <span className="text-sm font-bold text-navy-900">
                    {formatCurrency(totals.batterySystemCost)}
                  </span>
                </div>
                <input
                  id="batteryKwh"
                  type="range"
                  min={0}
                  max={20}
                  step={1}
                  value={batteryKwh}
                  onChange={(e) => setBatteryKwh(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
                {batteryKwh > 0 && (
                  <p className="mt-1 text-xs text-green-600">
                    Saves ~{formatCurrency(totals.batterySavings)}/year on electricity
                  </p>
                )}
              </div>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={hasEv}
                  onChange={(e) => setHasEv(e.target.checked)}
                  className="h-5 w-5 rounded accent-teal-600"
                />
                <div>
                  <span className="font-medium text-navy-900">🚗 I own or plan to buy an EV</span>
                  <p className="text-xs text-slate-500">Includes garage charging from your Garage room</p>
                </div>
              </label>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-navy-900 to-teal-900 card-padding text-white card-shadow">
            <h3 className="font-semibold">💰 Cost reduction preview</h3>
            <dl className="mt-4 space-y-3">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <dt className="text-slate-300">Current monthly bill</dt>
                <dd className="font-bold text-red-300">{formatCurrency(totals.totalMonthlyBill)}</dd>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <dt className="text-slate-300">New monthly bill</dt>
                <dd className="font-bold text-green-300">{formatCurrency(totals.newMonthlyBill)}</dd>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <dt className="text-slate-300">Monthly savings</dt>
                <dd className="font-bold text-gold-400">−{formatCurrency(totals.monthlySavings)}</dd>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <dt className="text-slate-300">Annual savings</dt>
                <dd className="font-bold text-green-300">{formatCurrency(totals.totalAnnualSavings)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-300">Cost reduction</dt>
                <dd className="font-bold text-gold-400">{totals.savingsPercent.toFixed(0)}%</dd>
              </div>
            </dl>
            <Button variant="gold" className="mt-4 w-full" onClick={() => setStep(3)}>
              See Full Price Breakdown →
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Current Monthly Bill', value: formatCurrency(totals.totalMonthlyBill), icon: '💵', sub: 'before upgrades' },
              { label: 'New Monthly Bill', value: formatCurrency(totals.newMonthlyBill), icon: '✅', sub: `save ${formatCurrency(totals.monthlySavings)}/mo` },
              { label: 'Annual Savings', value: formatCurrency(totals.totalAnnualSavings), icon: '💰', sub: `${totals.savingsPercent.toFixed(0)}% reduction` },
              { label: '20-Year Net Savings', value: formatCurrency(totals.lifetimeSavings20yr), icon: '📈', sub: 'after equipment cost' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-slate-200 bg-white card-padding card-shadow">
                <span className="text-2xl" aria-hidden="true">{stat.icon}</span>
                <p className="mt-2 text-xs font-medium text-slate-500">{stat.label}</p>
                <p className="mt-1 text-xl font-bold text-navy-900">{stat.value}</p>
                {stat.sub && <p className="mt-0.5 text-xs text-green-600">{stat.sub}</p>}
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white card-padding card-shadow">
            <h3 className="font-semibold text-navy-900">Room-by-room breakdown</h3>
            <div className="mt-4 space-y-2">
              {totals.roomBreakdown
                .sort((a, b) => b.monthlyKwh - a.monthlyKwh)
                .map(({ room, monthlyKwh, monthlyCost }) => (
                  <div key={room.id} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                    <span className="text-xl" aria-hidden="true">{room.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-navy-900">{room.name}</p>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${room.color}`}
                          style={{ width: `${Math.min(100, (monthlyKwh / totals.totalMonthlyKwh) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold text-navy-900">{formatNumber(monthlyKwh, { maximumFractionDigits: 0 })} kWh</p>
                      <p className="text-xs text-slate-500">{formatCurrency(monthlyCost)}/mo</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-navy-900 card-padding text-white">
              <p className="text-xs text-slate-400">Total equipment price</p>
              <p className="text-h2 font-bold">{formatCurrency(totals.systemCost)}</p>
              <p className="mt-1 text-xs text-slate-400">
                Solar {formatCurrency(totals.solarSystemCost)} + Battery {formatCurrency(totals.batterySystemCost)}
              </p>
            </div>
            <div className="rounded-xl bg-teal-700 card-padding text-white">
              <p className="text-xs text-teal-200">Payback period</p>
              <p className="text-h2 font-bold">{totals.paybackYears.toFixed(1)} years</p>
              <p className="mt-1 text-xs text-teal-200">Time to recover investment</p>
            </div>
            <div className="rounded-xl bg-green-600 card-padding text-white">
              <p className="text-xs text-green-200">You reduce costs by</p>
              <p className="text-h2 font-bold">{formatCurrency(totals.totalAnnualSavings)}/yr</p>
              <p className="mt-1 text-xs text-green-200">{formatCurrency(totals.monthlySavings)}/month</p>
            </div>
            <div className={`rounded-xl bg-gradient-to-br ${totals.badge.color} card-padding text-white`}>
              <p className="text-xs text-white/80">Final rank</p>
              <p className="text-h2 font-bold">{totals.badge.emoji} {totals.badge.label}</p>
              <p className="mt-1 text-xs text-white/80">{formatNumber(totals.annualGeneration, { maximumFractionDigits: 0 })} kWh solar/yr</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setStep(1)}>← Back to rooms</Button>
            <Button to={ROUTES.installers} variant="primary">Find a Certified Installer</Button>
            <Button to={ROUTES.education} variant="outline">Learn More</Button>
          </div>

          <p className="text-xs text-slate-500">
            Estimates use Bermuda averages ({SIMULATOR_CONSTANTS.avgRateBmd} BMD/kWh). Actual results vary by equipment, tariffs, and site conditions. Consult a certified installer for assessment.
          </p>
        </div>
      )}
    </div>
  )
}
