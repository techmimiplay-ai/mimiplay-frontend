import { motion, AnimatePresence } from 'framer-motion';

const ConfirmModal = ({ isOpen, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, variant = 'danger' }) => {
  const btnClass = variant === 'danger'
    ? 'bg-red-500 hover:bg-red-600 text-white'
    : 'bg-primary-500 hover:bg-primary-600 text-white';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 24 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl p-7 max-w-sm w-full shadow-2xl border-2 border-gray-100 text-center"
          >
            <div className="text-4xl mb-3">{variant === 'danger' ? '⚠️' : '❓'}</div>
            <h3 className="text-xl font-bold text-text mb-2">{title}</h3>
            {message && <p className="text-text/60 text-sm mb-6">{message}</p>}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-2xl border-2 border-gray-200 font-bold text-text/70 hover:bg-gray-50 transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 py-2.5 rounded-2xl font-bold transition-colors ${btnClass}`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
