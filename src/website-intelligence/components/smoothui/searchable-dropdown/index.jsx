"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { ChevronDown, Search, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
const ROTATION_ANGLE_OPEN = 180;
function SearchableDropdown({
  label,
  items,
  onChange,
  placeholder = "Search...",
  emptyMessage = "No results found",
  className = "",
  value
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(
    () => value != null ? items.find((item) => item.id === value) ?? null : null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const portalRef = useRef(null);
  const inputRef = useRef(null);
  const [position, setPosition] = useState({ left: 0, top: 0, width: 0 });
  const shouldReduceMotion = useReducedMotion();
  const reactId = useId();
  const listId = `searchable-dropdown-list-${reactId}`;
  const buttonId = `searchable-dropdown-button-${reactId}`;
  useEffect(() => {
    if (value == null) {
      setSelectedItem(null);
      return;
    }
    const match = items.find((item) => item.id === value) ?? null;
    setSelectedItem(match);
  }, [value, items]);
  const filteredItems = useMemo(() => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      return items;
    }
    const query = trimmedQuery.toLowerCase();
    const itemsLength = items.length;
    const results = [];
    for (let i = 0; i < itemsLength; i++) {
      const item = items[i];
      const itemLabel = item.label.toLowerCase();
      const description = item.description?.toLowerCase();
      if (itemLabel.includes(query) || description?.includes(query)) {
        results.push(item);
      }
    }
    return results;
  }, [items, searchQuery]);
  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setIsOpen(false);
    setSearchQuery("");
    onChange?.(item);
  };
  const handleClearSearch = () => {
    setSearchQuery("");
    inputRef.current?.focus();
  };
  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        left: rect.left,
        top: rect.bottom + 4,
        width: rect.width
      });
    }
    setIsOpen(!isOpen);
    if (isOpen) {
      setSearchQuery("");
    } else {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };
  useEffect(() => {
    if (!(isOpen && buttonRef.current)) {
      return;
    }
    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
          left: rect.left,
          top: rect.bottom + 4,
          width: rect.width
        });
      }
    };
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(target) && portalRef.current && !portalRef.current.contains(target)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) {
        if ((event.key === "Enter" || event.key === " ") && document.activeElement === buttonRef.current) {
          event.preventDefault();
          handleToggle();
        }
        return;
      }
      if (event.key === "Escape") {
        setIsOpen(false);
        setSearchQuery("");
        setFocusedIndex(-1);
        buttonRef.current?.focus();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setFocusedIndex(
          (prev) => prev < filteredItems.length - 1 ? prev + 1 : 0
        );
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setFocusedIndex(
          (prev) => prev > 0 ? prev - 1 : filteredItems.length - 1
        );
      } else if (event.key === "Enter" && focusedIndex >= 0) {
        event.preventDefault();
        const item = filteredItems[focusedIndex];
        if (item) {
          handleItemSelect(item);
        }
      } else if (event.key === "Home") {
        event.preventDefault();
        setFocusedIndex(0);
      } else if (event.key === "End") {
        event.preventDefault();
        setFocusedIndex(filteredItems.length - 1);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, focusedIndex, handleItemSelect, handleToggle]);
  useEffect(() => {
    setFocusedIndex(-1);
  }, []);
  const dropdownContent = /* @__PURE__ */ jsx(AnimatePresence, { children: isOpen ? /* @__PURE__ */ jsx("div", { ref: portalRef, children: /* @__PURE__ */ jsxs(
    motion.div,
    {
      animate: shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scaleY: 1, y: 0 },
      className: "fixed z-50 origin-top overflow-hidden rounded-lg border bg-background/95 shadow-lg backdrop-blur-md",
      exit: shouldReduceMotion ? { opacity: 0, transition: { duration: 0 } } : {
        opacity: 0,
        scaleY: 0.8,
        transition: { duration: 0.15 },
        y: -10
      },
      initial: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scaleY: 0.8, y: -10 },
      style: {
        left: `${position.left}px`,
        top: `${position.top}px`,
        width: `${position.width}px`
      },
      transition: shouldReduceMotion ? { duration: 0 } : {
        damping: 30,
        duration: 0.25,
        mass: 0.8,
        stiffness: 400,
        type: "spring"
      },
      children: [
        /* @__PURE__ */ jsx("div", { className: "relative border-b p-2", children: /* @__PURE__ */ jsxs(
          motion.div,
          {
            animate: shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 },
            className: "relative",
            initial: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -10 },
            transition: shouldReduceMotion ? { duration: 0 } : {
              damping: 25,
              delay: 0.05,
              duration: 0.2,
              stiffness: 400,
              type: "spring"
            },
            children: [
              /* @__PURE__ */ jsx(Search, { className: "absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  "aria-autocomplete": "list",
                  "aria-controls": listId,
                  "aria-expanded": isOpen,
                  "aria-label": "Search dropdown items",
                  className: "w-full rounded-md border bg-transparent py-2 pr-8 pl-9 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  onChange: (e) => {
                    setSearchQuery(e.target.value);
                    setFocusedIndex(-1);
                  },
                  placeholder,
                  ref: inputRef,
                  role: "combobox",
                  type: "text",
                  value: searchQuery
                }
              ),
              /* @__PURE__ */ jsx(AnimatePresence, { children: searchQuery ? /* @__PURE__ */ jsx(
                motion.button,
                {
                  animate: { opacity: 1 },
                  "aria-label": "Clear search",
                  className: "absolute top-1/2 right-2 min-h-[44px] min-w-[44px] -translate-y-1/2 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  exit: { opacity: 0 },
                  initial: { opacity: 0 },
                  onClick: handleClearSearch,
                  transition: {
                    damping: 25,
                    stiffness: 400,
                    type: "spring"
                  },
                  type: "button",
                  children: /* @__PURE__ */ jsx(X, { "aria-hidden": "true", className: "h-4 w-4" })
                }
              ) : null })
            ]
          }
        ) }),
        /* @__PURE__ */ jsx(
          "ul",
          {
            "aria-label": "Dropdown options",
            className: "max-h-60 overflow-y-auto py-2",
            id: listId,
            children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "popLayout", children: filteredItems.length > 0 ? filteredItems.map((item, index) => /* @__PURE__ */ jsx(
              motion.li,
              {
                animate: shouldReduceMotion ? { opacity: 1 } : { filter: "blur(0px)", opacity: 1, x: 0 },
                "aria-selected": selectedItem?.id === item.id || index === focusedIndex,
                className: "block",
                exit: shouldReduceMotion ? { opacity: 0, transition: { duration: 0 } } : { filter: "blur(4px)", opacity: 0, x: -10 },
                initial: shouldReduceMotion ? { opacity: 1 } : { filter: "blur(4px)", opacity: 0, x: -10 },
                layout: true,
                role: "option",
                transition: shouldReduceMotion ? { duration: 0 } : {
                  damping: 28,
                  delay: index * 0.02,
                  duration: 0.2,
                  mass: 0.6,
                  stiffness: 400,
                  type: "spring"
                },
                children: /* @__PURE__ */ jsxs(
                  "button",
                  {
                    "aria-label": `${item.label}${item.description ? `, ${item.description}` : ""}`,
                    className: `flex min-h-[44px] w-full items-center px-4 py-2 text-left text-sm transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${selectedItem?.id === item.id ? "font-medium text-brand" : ""} ${index === focusedIndex ? "bg-muted" : ""}`,
                    onClick: () => handleItemSelect(item),
                    onMouseEnter: () => setFocusedIndex(index),
                    type: "button",
                    children: [
                      item.icon ? /* @__PURE__ */ jsx("span", { className: "mr-3 shrink-0", children: item.icon }) : null,
                      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                        /* @__PURE__ */ jsx("span", { className: "block truncate", children: item.label }),
                        item.description ? /* @__PURE__ */ jsx("span", { className: "block truncate text-muted-foreground text-xs", children: item.description }) : null
                      ] }),
                      selectedItem?.id === item.id && /* @__PURE__ */ jsx(
                        motion.span,
                        {
                          animate: shouldReduceMotion ? {} : { scale: 1 },
                          className: "ml-2 shrink-0",
                          initial: shouldReduceMotion ? {} : { scale: 0 },
                          transition: shouldReduceMotion ? { duration: 0 } : {
                            damping: 25,
                            duration: 0.2,
                            mass: 0.5,
                            stiffness: 400,
                            type: "spring"
                          },
                          children: /* @__PURE__ */ jsxs(
                            "svg",
                            {
                              className: "h-4 w-4 text-brand",
                              fill: "none",
                              stroke: "currentColor",
                              viewBox: "0 0 24 24",
                              children: [
                                /* @__PURE__ */ jsx("title", { children: "Selected" }),
                                /* @__PURE__ */ jsx(
                                  "path",
                                  {
                                    d: "M5 13l4 4L19 7",
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    strokeWidth: 2
                                  }
                                )
                              ]
                            }
                          )
                        }
                      )
                    ]
                  }
                )
              },
              item.id
            )) : /* @__PURE__ */ jsx(
              motion.li,
              {
                animate: { opacity: 1 },
                className: "px-4 py-8 text-center text-muted-foreground text-sm",
                initial: shouldReduceMotion ? { opacity: 1 } : { opacity: 0 },
                transition: shouldReduceMotion ? { duration: 0 } : {
                  damping: 25,
                  duration: 0.2,
                  stiffness: 400,
                  type: "spring"
                },
                children: emptyMessage
              }
            ) })
          }
        )
      ]
    }
  ) }) : null });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: cn("relative block w-full", className), ref: dropdownRef, children: /* @__PURE__ */ jsxs(
      "button",
      {
        "aria-expanded": isOpen,
        "aria-haspopup": "listbox",
        "aria-label": selectedItem ? `${label}: ${selectedItem.label}` : label,
        className: "flex min-h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        id: buttonId,
        onClick: handleToggle,
        ref: buttonRef,
        type: "button",
        children: [
          /* @__PURE__ */ jsx("span", { className: "block truncate", children: String(selectedItem ? selectedItem.label : label) }),
          /* @__PURE__ */ jsx(
            motion.div,
            {
              animate: { rotate: isOpen ? ROTATION_ANGLE_OPEN : 0 },
              transition: shouldReduceMotion ? { duration: 0 } : {
                damping: 25,
                duration: 0.2,
                stiffness: 400,
                type: "spring"
              },
              children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" })
            }
          )
        ]
      }
    ) }),
    typeof window !== "undefined" && createPortal(dropdownContent, document.body)
  ] });
}
export {
  SearchableDropdown as default
};
