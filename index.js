'use strict';

const _ = require('lodash');

const TOKEN = '|'
const DATE_PORTION_REGEXP = /^([-+])\s*(\d+)\s*(\w+)?$/

const units = new Set();
['month', 'week', 'day'].forEach(units.add, units)

function today (expression) {
    if (!_.startsWith(expression, 'TODAY')) {
        return Error(`"${expression}" does not start with TODAY`)
    }
    return expression
        .slice(5)
        .trim()
        .replace(/[-+]/g, '|$&')
        .split(TOKEN)
        .filter(_.identity)
        .map(_.trim)
        .map(splitUnitAndQuantity)
        .reduce(function (memo, e) {
            if (memo.message) {
                return memo;
            } else if (e.message) {
                return e;
            } else {
                const current = memo[e.unit];
                memo[e.unit] = (current || 0) + e.quantity;
                return memo;
            }
        }, {});
}

function splitUnitAndQuantity(chunk) {
    const matches = chunk.match(DATE_PORTION_REGEXP);
    if (!matches) {
        return Error(`"${chunk}" is not valid portion of date`);
    }

    const sign = matches[1] === '-' ? -1 : 1;
    const quantity = parseInt(matches[2]);
    let unit = matches[3].toLowerCase();
    if (_.endsWith(unit, 's')) {
        unit = unit.slice(0, -1);
    }

    const err = validate(quantity, unit);
    if (err) {
        return err;
    }

    return {
        quantity: sign * quantity,
        unit: unit
    };
}

function validate (quantity, unit) {
    if (!_.isFinite(quantity)) {
        return Error(`"${quantity}" is not finite`);
    } else if (!units.has(unit)) {
        return Error(`"${unit}" is not valid unit`);
    }
}

console.log(today('TODAY + 1 month + 2 days - 1 week + 3 days'));
//console.log(splitUnitAndQuantity('+ 213    ureys'))