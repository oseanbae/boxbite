import PlannerSlot from './PlannerSlot'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner']

/**
 * PlannerDay - Represents a single day with 3 meal slots
 */
export default function PlannerDay({
  dayIndex,
  slots,
  onViewSlot,
  onRemoveSlot,
  onAddSlot,
  onSurpriseSlot,
  isSlotLoading,
}) {
  const dayName = DAYS[dayIndex]
  const daySlots = slots || { breakfast: null, lunch: null, dinner: null }

  return (
    <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-4">
      <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">{dayName}</h3>
      <div className="space-y-3">
        {MEAL_TYPES.map((mealType) => (
          <PlannerSlot
            key={mealType}
            mealType={mealType}
            recipe={daySlots[mealType]}
            onView={() => {
              if (daySlots[mealType]) {
                onViewSlot(dayIndex, mealType)
              }
            }}
            onRemove={() => onRemoveSlot(dayIndex, mealType)}
            onAdd={() => onAddSlot(dayIndex, mealType)}
            onSurprise={() => onSurpriseSlot(dayIndex, mealType)}
            isLoading={isSlotLoading === `${dayIndex}-${mealType}`}
          />
        ))}
      </div>
    </div>
  )
}

