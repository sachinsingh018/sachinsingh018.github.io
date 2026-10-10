import { AnimatePresence, motion } from 'motion/react'
import { Check } from 'lucide-react'

export function Toast({ message, show }: { message: string; show: boolean }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4" role="status" aria-live="polite">
      <AnimatePresence>
        {show ? (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
            className="flex items-center gap-2 rounded-full border border-line-strong bg-surface-2 px-4 py-2 text-sm text-fg shadow-lg"
          >
            <Check size={15} className="text-ok" aria-hidden="true" />
            {message}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
