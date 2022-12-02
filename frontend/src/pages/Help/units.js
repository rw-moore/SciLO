import React from 'react';
import './units.css';

export default function Units(props) {
	return (
		<div id="Help_units">
			<span>
				Most units support prefixes like <code>k</code> or <code>kilo</code> and many units
				have both a full name and an abbreviation.
			</span>
			<br />
			<span>The available units are:</span>
			<table>
				<thead>
					<tr>
						<th>Base</th>
						<th>Unit</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Length</td>
						<td>
							meter (m), inch (in), foot (ft), yard (yd), mile (mi), link (li), rod
							(rd), chain (ch), angstrom, mil
						</td>
					</tr>
					<tr>
						<td>Surface area</td>
						<td>m2, sqin, sqft, sqyd, sqmi, sqrd, sqch, sqmil, acre, hectare</td>
					</tr>
					<tr>
						<td>Volume</td>
						<td>
							m3, litre (l, L, lt, liter), cc, cuin, cuft, cuyd, teaspoon, tablespoon
						</td>
					</tr>
					<tr>
						<td>Liquid volume</td>
						<td>
							minim, fluiddram (fldr), fluidounce (floz), gill (gi), cup (cp), pint
							(pt), quart (qt), gallon (gal), beerbarrel (bbl), oilbarrel (obl),
							hogshead, drop (gtt)
						</td>
					</tr>
					<tr>
						<td>Angles</td>
						<td>
							rad (radian), deg (degree), grad (gradian), cycle, arcsec (arcsecond),
							arcmin (arcminute)
						</td>
					</tr>
					<tr>
						<td>Time</td>
						<td>
							second (s, secs, seconds), minute (min, mins, minutes), hour (h, hr,
							hrs, hours), day (days), week (weeks), month (months), year (years),
							decade (decades), century (centuries), millennium (millennia)
						</td>
					</tr>
					<tr>
						<td>Frequency</td>
						<td>hertz (Hz)</td>
					</tr>
					<tr>
						<td>Mass</td>
						<td>
							gram(g), tonne, ton, grain (gr), dram (dr), ounce (oz), poundmass (lbm,
							lb, lbs), hundredweight (cwt), stick, stone
						</td>
					</tr>
					<tr>
						<td>Electric current</td>
						<td>ampere (A)</td>
					</tr>
					<tr>
						<td>Temperature</td>
						<td>kelvin (K), celsius (degC), fahrenheit (degF), rankine (degR)</td>
					</tr>
					<tr>
						<td>Amount of substance</td>
						<td>mole (mol)</td>
					</tr>
					<tr>
						<td>Luminous intensity</td>
						<td>candela (cd)</td>
					</tr>
					<tr>
						<td>Force</td>
						<td>newton (N), dyne (dyn), poundforce (lbf), kip</td>
					</tr>
					<tr>
						<td>Energy</td>
						<td>joule (J), erg, Wh, BTU, electronvolt (eV)</td>
					</tr>
					<tr>
						<td>Power</td>
						<td>watt (W), hp</td>
					</tr>
					<tr>
						<td>Pressure</td>
						<td>Pa, psi, atm, torr, bar, mmHg, mmH2O, cmH2O</td>
					</tr>
					<tr>
						<td>Electricity and magnetism</td>
						<td>
							ampere (A), coulomb (C), watt (W), volt (V), ohm, farad (F), weber (Wb),
							tesla (T), henry (H), siemens (S), electronvolt (eV)
						</td>
					</tr>
					<tr>
						<td>Binary</td>
						<td>bits (b), bytes (B)</td>
					</tr>
				</tbody>
			</table>
			<span>The following decimal prefixes are available.</span>
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Abbreviation</th>
						<th>Value</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>deca</td>
						<td>da</td>
						<td>1e1</td>
					</tr>
					<tr>
						<td>hecto</td>
						<td>h</td>
						<td>1e2</td>
					</tr>
					<tr>
						<td>kilo</td>
						<td>k</td>
						<td>1e3</td>
					</tr>
					<tr>
						<td>mega</td>
						<td>M</td>
						<td>1e6</td>
					</tr>
					<tr>
						<td>giga</td>
						<td>G</td>
						<td>1e9</td>
					</tr>
					<tr>
						<td>tera</td>
						<td>T</td>
						<td>1e12</td>
					</tr>
					<tr>
						<td>peta</td>
						<td>P</td>
						<td>1e15</td>
					</tr>
					<tr>
						<td>exa</td>
						<td>E</td>
						<td>1e18</td>
					</tr>
					<tr>
						<td>zetta</td>
						<td>Z</td>
						<td>1e21</td>
					</tr>
					<tr>
						<td>yotta</td>
						<td>Y</td>
						<td>1e24</td>
					</tr>
				</tbody>
			</table>
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Abbreviation</th>
						<th>Value</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>deci</td>
						<td>d</td>
						<td>1e-1</td>
					</tr>
					<tr>
						<td>centi</td>
						<td>c</td>
						<td>1e-2</td>
					</tr>
					<tr>
						<td>milli</td>
						<td>m</td>
						<td>1e-3</td>
					</tr>
					<tr>
						<td>micro</td>
						<td>u</td>
						<td>1e-6</td>
					</tr>
					<tr>
						<td>nano</td>
						<td>n</td>
						<td>1e-9</td>
					</tr>
					<tr>
						<td>pico</td>
						<td>p</td>
						<td>1e-12</td>
					</tr>
					<tr>
						<td>femto</td>
						<td>f</td>
						<td>1e-15</td>
					</tr>
					<tr>
						<td>atto</td>
						<td>a</td>
						<td>1e-18</td>
					</tr>
					<tr>
						<td>zepto</td>
						<td>z</td>
						<td>1e-21</td>
					</tr>
					<tr>
						<td>yocto</td>
						<td>y</td>
						<td>1e-24</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
}
