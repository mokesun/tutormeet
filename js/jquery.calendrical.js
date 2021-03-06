(function($) {    
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
        
    function getToday()
    {
        var date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    
    function areDatesEqual(date1, date2)
    {
        return String(date1) == String(date2);
    }
    
    function daysInMonth(year, month)
    {
        if (year instanceof Date) return daysInMonth(year.getFullYear(), year.getMonth());
        if (month == 1) {
            var leapYear = (year % 4 == 0) &&
                (!(year % 100 == 0) || (year % 400 == 0));
            return leapYear ? 29 : 28;
        } else if (month == 3 || month == 5 || month == 8 || month == 10) {
            return 30;
        } else {
            return 31;
        }
    }
    
    function dayAfter(date)
    {
        var year = date.getFullYear();
        var month = date.getMonth();
        var day = date.getDate();
        var lastDay = daysInMonth(date);
        return (day == lastDay) ?
            ((month == 11) ?
                new Date(year + 1, 0, 1) :
                new Date(year, month + 1, 1)
            ) :
            new Date(year, month, day + 1);
    }
    
    function dayBefore(date)
    {
        var year = date.getFullYear();
        var month = date.getMonth();
        var day = date.getDate();
        return (day == 1) ?
            ((month == 0) ?
                new Date(year - 1, 11, daysInMonth(year - 1, 11)) :
                new Date(year, month - 1, daysInMonth(year, month - 1))
            ) :
            new Date(year, month, day - 1);
    }
    
    function monthAfter(year, month)
    {
        return (month == 11) ?
            new Date(year + 1, 0, 1) :
            new Date(year, month + 1, 1);
    }
    
    function formatDate(date, usa)
    {
    /*
        alert(usa);
        alert((usa ?
            ((date.getMonth() + 1) + '/' + date.getDate()) :
            (date.getDate() + '/' + (date.getMonth() + 1))
        ) + '/' + date.getFullYear());*/
        return (usa ?
            ((date.getMonth() + 1) + '/' + date.getDate()) :
            (date.getDate() + '/' + (date.getMonth() + 1))
        ) + '/' + date.getFullYear(); 
    }
    
    function parseDate(date, usa)
    {
        if (usa) return new Date(date);
        a = date.split(/[\.\-\/]/);
        var day = a.shift();
        var month = a.shift();
        a.unshift(day);
        a.unshift(month);
        return new Date(a.join('/'));
    }
    
    function formatTime(hour, minute)
    {
        var printHour = hour % 12;
        //if (printHour == 0) printHour = 12;
        var printMinute = minute;
        if (minute < 10) printMinute = '0' + minute;
        var half = (hour < 12 && hour >= 0) ? ' am' : ' pm';
        if(hour==12) printHour="12";
        return printHour + ':' + printMinute + half;
    }
    
    function parseTime(text)
    {
        var match = match = /(\d+)\s*[:\-\.,]\s*(\d+)\s*(am|pm)?/i.exec(text);
        if (match && match.length >= 3) {
            var hour = Number(match[1]);
            var minute = Number(match[2])
            if (hour == 12 && match[3]) hour -= 12;
            if (match[3] && match[3].toLowerCase() == 'pm') hour += 12;
            return {
                hour:   hour,
                minute: minute
            };
        } else {
            return null;
        }
    }
    
    function renderCalendarPage(element, year, month, options)
    {
        options = options || {};
        
        var today = getToday();
        
        var date = new Date(year, month, 1);
        
        //Wind end date forward to saturday week after month
        var endDate = monthAfter(year, month);
        var ff = 6 - endDate.getDay();
        if (ff < 6) ff += 7;
        for (var i = 0; i < ff; i++) endDate = dayAfter(endDate);
        
        var table = $('<table />');
        var thead = $('<thead />').appendTo(table);
        var tMonth = $('<tr />').appendTo(thead);
        $('<th />').addClass('monthCell').attr('colspan', 7).append(
            $('<a href="javascript:;">&laquo;</a>')
                .addClass('prevMonth')
                .mousedown(function(e) {
                    renderCalendarPage(element,
                        month == 0 ? (year - 1) : year,
                        month == 0 ? 11 : (month - 1), options
                    );
                    e.preventDefault();
                }),
            $('<a href="javascript:;">' + monthNames[date.getMonth()] + ' ' +
                date.getFullYear() + '</a>').addClass('monthName'),
            $('<a href="javascript:;">&raquo;</a>')
                .addClass('nextMonth')
                .mousedown(function() {
                    renderCalendarPage(element,
                        month == 11 ? (year + 1) : year,
                        month == 11 ? 0 : (month + 1), options
                    );
                })
        ).appendTo(tMonth);
        var dayNames = $('<tr />').appendTo(thead);
        $.each(String('SMTWTFS').split(''), function(k, v) {
            $('<td />').addClass('dayName').append(v).appendTo(dayNames);
        });
        var tbody = $('<tbody />').appendTo(table);
        var row = $('<tr />');

        //Rewind date to monday week before month
        var rewind = date.getDay() + 7;
        for (var i = 0; i < rewind; i++) date = dayBefore(date);
        
        while (date <= endDate) {
            var td = $('<td />')
                .addClass('day')
                .append(
                    $('<a href="javascript:;">' +
                        date.getDate() + '</a>'
                    ).click((function() {
                        var thisDate = date;
                        
                        return function() {
                            if (options && options.selectDate) {
                                options.selectDate(thisDate);
                            }
                        }
                    }()))
                )
                .appendTo(row);
            
            var isToday     = areDatesEqual(date, today);
            var isSelected  = options.selected &&
                                areDatesEqual(options.selected, date);
            
            if (isToday)                    td.addClass('today');
            if (isSelected)                 td.addClass('selected');
            if (isToday && isSelected)      td.addClass('today_selected');
            if (date.getMonth() != month)   td.addClass('nonMonth');
            
            dow = date.getDay();
            if (dow == 6) {
                tbody.append(row);
                row = $('<tr />');
            }
            date = dayAfter(date);
        }
        if (row.children().length) {
            tbody.append(row);
        } else {
            row.remove();
        }
        
        element.empty().append(table);
    }
    
    function renderTimeSelect(element, options)
    {
        var selection = options.selection && parseTime(options.selection);
        if (selection) {
            selection.minute = Math.floor(selection.minute / 30.0) * 30;
        }
        var startTime = options.startTime &&
            (options.startTime.hour * 60 + options.startTime.minute);
        
        var ul = $('<ul />');
        for (var hour = 0; hour < 24; hour++) {
            for (var minute = 0; minute < 60; minute += 5) {
                if (startTime && startTime > (hour * 60 + minute)) continue;
                
                (function() {
                    var timeText = formatTime(hour, minute);
                    //alert(hour+":"+timeText);
                    var fullText = timeText;
                    if (startTime != null) {
                        var duration = (hour * 60 + minute) - startTime;
                        if (duration < 60) {
                            fullText += ' (' + duration + ' mins)';
                        } else if (duration == 60) {
                            fullText += ' (1 hr)';
                        } else {
                            fullText += ' (' + (duration / 60.0) + ' hrs)';
                        }
                    }
                    var li = $('<li />').append(
                        $('<a href="javascript:;">' + fullText + '</a>')
                        .click(function() {
                            if (options && options.selectTime) {
                                options.selectTime(timeText);
                            }
                        }).mousemove(function() {
                            $('li.selected', ul).removeClass('selected');
                        })
                    ).appendTo(ul);
                    if (selection &&
                        selection.hour == hour &&
                        selection.minute == minute)
                    {
                        li.addClass('selected');
                        setTimeout(function() {
                            element[0].scrollTop = li[0].offsetTop - li.height() * 2;
                        }, 0)
                    }
                })();
            }
        }

        element.empty().append(ul);
    }
    
    $.fn.calendricalDate = function(options)
    {
        options = options || {};
        options.padding = options.padding || 4;
            return this.each(function() {
            var element = $(this);
            var div;
            
            element.bind('focus click', function() {
                if (div) return;
                var offset = element.offset();
                var padding = element.css('padding-left');
                div = $('<div />')
                    .addClass('calendricalDatePopup')
                    .mousedown(function(e) {
                        e.preventDefault();
                    })
                    .css({
                        position: 'absolute',
                        left: offset.left,
                        top: offset.top + element.height() +
                            options.padding * 2
                    });
                element.after(div); 
                
                var selected = parseDate(element.val(), options.usa);
                if (!selected.getFullYear()) selected = getToday();
                
                renderCalendarPage(
                    div,
                    selected.getFullYear(),
                    selected.getMonth(), {
                        selected: selected,
                        selectDate: function(date) {
                            element.val(formatDate(date, options.usa));
                            div.remove();
                            div = null;
                            if (options.endDate) {
                                var endDate = parseDate(
                                    options.endDate.val(), options.usa
                                );
                                if (endDate >= selected) {
                                    options.endDate.val(formatDate(
                                        new Date(
                                            date.getTime() +
                                            endDate.getTime() -
                                            selected.getTime()
                                        )
                                    ));
                                }
                            }
                        }
                    }
                );
            }).blur(function() {
                if (!div) return;
                 window.setTimeout(function(){
                try{
                div.remove();
                div = null;
                }catch(e){}
                },2500);
            });
        });

        
    };
    var timeSVar;
    $.fn.calendricalDateRange = function(options)
    {
        if (this.length >= 2) {
            $(this[0]).calendricalDate($.extend({
                endDate:   $(this[1])
            }, options));
            $(this[1]).calendricalDate(options);
        }
        return this;
    };
    
    $.fn.calendricalTime = function(options)
    {
        options = options || {};
        options.padding = options.padding || 4;
        
        return this.each(function() {
            var element = $(this);
            var div;
            
            element.bind('focus click', function() {
                if (div) return;

                var useStartTime = options.startTime;
                if (useStartTime) {
                    if (options.startDate && options.endDate &&
                        !areDatesEqual(parseDate(options.startDate.val()),
                            parseDate(options.endDate.val())))
                        useStartTime = false;
                }

                var offset = element.offset();
                div = $('<div />')
                    .addClass('calendricalTimePopup')
                    .mousedown(function(e) {
                        e.preventDefault();
                    })
                    .css({
                        position: 'absolute',
                        left: offset.left,
                        top: offset.top + element.height() +
                            options.padding * 2
                    });
                if (useStartTime) {
                    div.addClass('calendricalEndTimePopup');
                }

                element.after(div);
                $(".calendricalTimePopup").scroll(function(e){
                    window.clearTimeout(timeSVar);
                    e.preventDefault();
                }); 
                var opts = {
                    selection: element.val(),
                    selectTime: function(time) {
                        element.val(time);
                        div.remove();
                        div = null;
                    }
                };
                
                if (useStartTime) {
                    opts.startTime = parseTime(options.startTime.val());
                }
                
                renderTimeSelect(div, opts);
            }).blur(function() {
                if (!div) return;
                //after click event evel
                //alert(div);
                timeSVar=window.setTimeout(function(){
                try{
                div.remove();
                div = null;
                }catch(e){}
                },300);
            });
        });
    },
    
    $.fn.calendricalTimeRange = function(options)
    {
        if (this.length >= 2) {
            $(this[0]).calendricalTime(options);
            $(this[1]).calendricalTime($.extend({
                startTime: $(this[0])
            }, options));
        }
        return this;
    };

    $.fn.calendricalDateTimeRange = function(options)
    {
        if (this.length >= 4) {
            $(this[0]).calendricalDate($.extend({
                endDate:   $(this[2])
            }, options));
            $(this[1]).calendricalTime(options);
            $(this[2]).calendricalDate(options);
            $(this[3]).calendricalTime($.extend({
                startTime: $(this[1]),
                startDate: $(this[0]),
                endDate:   $(this[2])
            }, options));
        }
        return this;
    };
})(jQuery);