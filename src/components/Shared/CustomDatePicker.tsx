'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  value: string;
  onChange: (date: string) => void;
  min?: string;
  className?: string;
  style?: React.CSSProperties;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CustomDatePicker({ value, onChange, min, className, style }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Parse current value or use today
  const currentDate = value ? new Date(value) : new Date();
  
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth());
  const [viewYear, setViewYear] = useState(currentDate.getFullYear());
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handleDateClick = (day: number) => {
    const newDate = new Date(viewYear, viewMonth, day);
    // adjust for local timezone offset when getting ISO string
    const offset = newDate.getTimezoneOffset() * 60000;
    const isoString = new Date(newDate.getTime() - offset).toISOString().split('T')[0];
    
    // Check if it's before min date
    if (min && isoString < min) return;
    
    onChange(isoString);
    setIsOpen(false);
  };

  const setToday = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    const isoString = new Date(today.getTime() - offset).toISOString().split('T')[0];
    
    if (!min || isoString >= min) {
      onChange(isoString);
      setViewMonth(today.getMonth());
      setViewYear(today.getFullYear());
      setIsOpen(false);
    }
  };

  const clearDate = () => {
    onChange('');
    setIsOpen(false);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  
  const daysInPrevMonth = viewMonth === 0 ? getDaysInMonth(viewYear - 1, 11) : getDaysInMonth(viewYear, viewMonth - 1);

  // Generate grid days
  const grid = [];
  
  // Previous month trailing days
  for (let i = 0; i < firstDay; i++) {
    const day = daysInPrevMonth - firstDay + i + 1;
    grid.push({ day, isCurrentMonth: false, isPast: true });
  }
  
  // Current month days
  const today = new Date();
  for (let i = 1; i <= daysInMonth; i++) {
    const dateObj = new Date(viewYear, viewMonth, i);
    const offset = dateObj.getTimezoneOffset() * 60000;
    const isoString = new Date(dateObj.getTime() - offset).toISOString().split('T')[0];
    
    const isMinRestricted = min ? isoString < min : false;
    const isSelected = value === isoString;
    const isToday = today.getDate() === i && today.getMonth() === viewMonth && today.getFullYear() === viewYear;
    
    grid.push({ day: i, isCurrentMonth: true, isMinRestricted, isSelected, isToday });
  }
  
  // Next month leading days (fill up to 42 slots, 6 rows of 7)
  const remainingSlots = 42 - grid.length;
  for (let i = 1; i <= remainingSlots; i++) {
    grid.push({ day: i, isCurrentMonth: false, isPast: false });
  }

  // Format display value
  const displayValue = value ? new Date(value).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Select Date';

  return (
    <div className="relative w-full" ref={containerRef}>
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between text-left ${className}`}
        style={style}
      >
        <span className={value ? 'text-white' : 'text-gray-400'}>{displayValue}</span>
        <CalendarIcon className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div 
          className="absolute z-50 top-[calc(100%+8px)] left-0 p-3 rounded-xl shadow-2xl animate-fade-in w-64"
          style={{ background: 'rgba(13,15,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-1 cursor-pointer hover:opacity-80">
              <span className="font-bold text-white text-sm">{MONTHS[viewMonth]} {viewYear}</span>
              <ChevronDown className="w-4 h-4 text-[#f5a623]" />
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <button type="button" onClick={handlePrevMonth} className="hover:text-[#f5a623] transition p-1">
                <ChevronUp className="w-4 h-4" />
              </button>
              <button type="button" onClick={handleNextMonth} className="hover:text-[#f5a623] transition p-1">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d, i) => (
              <div key={i} className="text-center text-[10px] font-bold text-gray-500 mb-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {grid.map((cell, index) => {
              if (!cell.isCurrentMonth) {
                return (
                  <div key={index} className="flex items-center justify-center w-7 h-7 text-xs text-gray-600 mx-auto">
                    {cell.day}
                  </div>
                );
              }
              
              let cellClass = "flex items-center justify-center w-7 h-7 rounded text-xs transition mx-auto ";
              
              if (cell.isMinRestricted) {
                cellClass += "text-gray-600 cursor-not-allowed";
              } else if (cell.isSelected) {
                cellClass += "bg-gradient-to-br from-[#f5a623] to-[#e8810a] text-[#07080f] font-bold shadow-md cursor-pointer hover:opacity-90"; 
              } else if (cell.isToday) {
                cellClass += "border border-[#00d4aa] text-[#00d4aa] font-bold cursor-pointer hover:bg-[#00d4aa]/10";
              } else {
                cellClass += "text-gray-200 font-medium cursor-pointer hover:bg-[#f5a623]/20 hover:text-[#f5a623]";
              }

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => !cell.isMinRestricted && handleDateClick(cell.day)}
                  disabled={cell.isMinRestricted}
                  className={cellClass}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-between mt-3 px-1 pt-2 border-t border-white/5">
            <button type="button" onClick={clearDate} className="text-[#00d4aa] text-[11px] hover:text-[#00e6b8] transition font-semibold tracking-wide uppercase">
              Clear
            </button>
            <button type="button" onClick={setToday} className="text-[#00d4aa] text-[11px] hover:text-[#00e6b8] transition font-semibold tracking-wide uppercase">
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
