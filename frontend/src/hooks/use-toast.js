"use client";
// Inspired by react-hot-toast library
import * as React from "react"

/**
 * @typedef {'default' | 'destructive'} ToastVariant
 */

/**
 * @typedef {Object} Toast
 * @property {string} id - Unique identifier for the toast
 * @property {string} [title] - Toast title
 * @property {string} [description] - Toast description
 * @property {ToastVariant} [variant] - Toast variant style
 * @property {boolean} [open] - Whether toast is visible
 * @property {(open: boolean) => void} [onOpenChange] - Callback when open state changes
 * @property {React.ReactNode} [action] - Optional action element
 */

/**
 * @typedef {Object} ToastState
 * @property {Toast[]} toasts - Array of active toasts
 */

/**
 * @typedef {'ADD_TOAST' | 'UPDATE_TOAST' | 'DISMISS_TOAST' | 'REMOVE_TOAST'} ActionType
 */

/**
 * @typedef {Object} ToastAction
 * @property {ActionType} type - The action type
 * @property {Toast} [toast] - The toast data (for ADD_TOAST, UPDATE_TOAST)
 * @property {string} [toastId] - The toast ID (for DISMISS_TOAST, REMOVE_TOAST)
 */

/**
 * @typedef {Object} ToastAPI
 * @property {string} id - Toast ID
 * @property {() => void} dismiss - Dismiss this toast
 * @property {(props: Partial<Toast>) => void} update - Update this toast
 */

/** @type {number} */
const TOAST_LIMIT = 1
/** @type {number} */
const TOAST_REMOVE_DELAY = 1000000

/** @type {Readonly<Record<ActionType, ActionType>>} */
const actionTypes = /** @type {const} */ ({
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST"
})

/** @type {number} */
let count = 0

/**
 * Generates a unique ID for toasts
 * @returns {string} A unique string ID
 */
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString();
}

/** @type {Map<string, ReturnType<typeof setTimeout>>} */
const toastTimeouts = new Map()

/**
 * Adds a toast to the removal queue
 * @param {string} toastId - The ID of the toast to remove
 * @returns {void}
 */
const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

/**
 * Toast state reducer
 * @param {ToastState} state - Current state
 * @param {ToastAction} action - Action to perform
 * @returns {ToastState} New state
 */
export const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t),
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
}

/** @type {Array<(state: ToastState) => void>} */
const listeners = []

/** @type {ToastState} */
let memoryState = { toasts: [] }

/**
 * Dispatches an action to update toast state
 * @param {ToastAction} action - The action to dispatch
 * @returns {void}
 */
function dispatch(action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

/**
 * Creates and displays a new toast
 * @param {Omit<Toast, 'id'>} props - Toast properties
 * @returns {ToastAPI} API to control the toast
 */
function toast({
  ...props
}) {
  const id = genId()

  /**
   * Updates the toast with new properties
   * @param {Partial<Toast>} props - Properties to update
   */
  const update = (props) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  /** @returns {void} */
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

/**
 * @typedef {Object} UseToastReturn
 * @property {Toast[]} toasts - Array of active toasts
 * @property {(props: Omit<Toast, 'id'>) => ToastAPI} toast - Function to create a toast
 * @property {(toastId?: string) => void} dismiss - Function to dismiss a toast
 */

/**
 * Hook to manage toast notifications
 * @returns {UseToastReturn} Toast state and functions
 */
function useToast() {
  /** @type {[ToastState, React.Dispatch<React.SetStateAction<ToastState>>]} */
  const [state, setState] = React.useState(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    };
  }, [state])

  return {
    ...state,
    toast,
    dismiss: /** @param {string} [toastId] */ (toastId) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { useToast, toast }
