#!/usr/bin/env python3
"""Private gold / roll workbook for the 5-2 study. Writes outside the website (work/fiveTwo/)."""
import json, sys
from pathlib import Path
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.comments import Comment

W = Path(__file__).resolve().parents[2] / 'work' / 'fiveTwo36'
out = Path(sys.argv[1]) if len(sys.argv) > 1 else W / 'kanto-5-2-gold-and-rolls.xlsx'
budget = json.loads((W / 'budget.json').read_text())
analysis = json.loads((W / 'analysis.json').read_text())
data = json.loads((Path(__file__).resolve().parents[2] / 'simulation' / 'data-v36.json').read_text())
roster = {r['id']: r for r in data['roster']}
name = lambda l, s: roster[l]['forms'][min(s, len(roster[l]['forms'])) - 1]['name']

F = 'Arial'
HEAD = Font(name=F, bold=True, color='FFFFFF'); HFILL = PatternFill('solid', fgColor='1F4E3D')
BODY = Font(name=F); BOLD = Font(name=F, bold=True); NOTE = Font(name=F, italic=True, color='555555', size=9)
TITLE = Font(name=F, bold=True, size=14)
thin = Side(style='thin', color='D0D0D0'); BOX = Border(bottom=thin)
wb = Workbook()

def sheet(ws, title, note, headers, rows, fmts, widths):
    ws['A1'] = title; ws['A1'].font = TITLE
    ws['A2'] = note; ws['A2'].font = NOTE; ws['A2'].alignment = Alignment(wrap_text=True, vertical='top')
    ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=len(headers)); ws.row_dimensions[2].height = 48
    for j, h in enumerate(headers, 1):
        c = ws.cell(row=4, column=j, value=h); c.font = HEAD; c.fill = HFILL; c.alignment = Alignment(wrap_text=True, vertical='center')
    ws.row_dimensions[4].height = 34
    for i, row in enumerate(rows, 5):
        for j, v in enumerate(row, 1):
            c = ws.cell(row=i, column=j, value=v); c.font = BODY; c.border = BOX
            if fmts[j - 1]: c.number_format = fmts[j - 1]
    for j, w in enumerate(widths, 1): ws.column_dimensions[get_column_letter(j)].width = w
    ws.freeze_panes = 'B5'
    return 5, 4 + len(rows)

P, G1, G0, I = '0.0%', '0.0', '0', None

# 1. Gold audit
ws = wb.active; ws.title = 'Gold audit'
rows = []
for k, v in budget['audit'].items():
    r = len(rows) + 5
    rows.append([{'none': 'No levelling (hoard)', '5': 'Level 5 by 2-5', '6': 'Level 6 by 3-2', '7': 'Level 7 by 4-1', '8': 'Level 8 by 4-2'}[v['curve']], v['profile'], v['games'],
                 v['earned'], v['interest'], v['streak'], v['earned'] - v['interest'] - v['streak'], v['xpGold'], f'=D{r}-H{r}', v['goldAt31'], v['goldAt42'], v['level']])
a, b = sheet(ws, 'Gold audit: average gold per game up to 5-2',
  'Native v36 PvP economy, no unit purchases: start 5 gold, +5 base, interest 1 per 10 (max 5), streak +1/+2/+3 at 2/3/5, +1 per PvP win, PvE gold, no income on carousel rounds. Win/loss profiles: win ≈72%, mixed 50%, lose ≈28% per PvP round, with streak persistence. Column I = gold you can spend on units and rolls by 5-2 (earned minus XP bought).',
  ['Level curve', 'Win/loss profile', 'Games', 'Gold earned by 5-2', 'from interest', 'from streaks', 'base + wins + PvE', 'Gold spent on XP', 'Spendable on units + rolls', 'Gold held at 3-1 (no spend)', 'Gold held at 4-2 (no spend)', 'Level at 5-2'],
  rows, [I, I, G0, G1, G1, G1, G1, G1, G1, G1, G1, '0.00'], [22, 14, 8, 14, 12, 12, 14, 12, 16, 14, 14, 10])
ws.cell(row=b + 2, column=1, value='Mixed-profile average spendable gold').font = BOLD
ws.cell(row=b + 2, column=9, value=f'=AVERAGEIF(B{a}:B{b},"mixed",I{a}:I{b})').number_format = G1

# 2. Reroll budget: how many 3-stars fit
ws = wb.create_sheet('Reroll budget')
rows = []
for c in budget['configs']:
    o, ct, w, l = (c['confirm'][k] for k in ('mixed|open', 'mixed|contested', 'win|open', 'lose|open'))
    r = len(rows) + 5
    rows.append([c['type'], c['k'], c['level'], f"{c['best']['from']} / floor {c['best']['floor']} / all-in {c['best']['allIn']}",
                 o['hit'], ct['hit'], w['hit'], l['hit'], o['tank4'], o['rollGold'], f'=J{r}/2', o['unitGold'], f'=J{r}+L{r}', o['hitRollMedian'], o['hitRollP80'], o['medianDone'], o['level']])
a, b = sheet(ws, 'How many 3★ targets fit in one 5-2 budget',
  'Full-game simulation from 1-1 to 5-2 planning, 400 games per row (mixed profile), shared pool with 7 opponents drawn from the official ranked meta. Targets are random lines of that cost; a random four-cost tank is chased alongside. "Contested" = one opponent builds the same targets. Policy picked from an 18-policy grid (highest hit rate, then least roll gold).',
  ['Plan', '3★ targets (4-cost: 2★)', 'Roll level', 'Best roll policy', 'Hit by 5-2', 'Hit, contested', 'Hit, win-streak', 'Hit, lose-streak', '4-cost tank 2★ by 5-2', 'Avg gold on rolls', 'Avg rolls', 'Avg gold on units', 'Avg gold units + rolls', 'Median roll gold when hit', '80th pct roll gold when hit', 'Median hit round', 'Avg level at 5-2'],
  rows, [I, G0, G0, I, P, P, P, P, P, G0, G0, G0, G0, G0, G0, I, '0.00'], [20, 11, 8, 30, 10, 10, 10, 10, 11, 10, 9, 10, 11, 12, 12, 10, 9])
recs = [('1-cost reroll', '1-2 targets at 3★ (≈93% / ≈80% by 5-2 at level 5). Three ≈71%, four ≈64%; with one contested line, two drop to ≈51%.'),
        ('2-cost reroll', '1 target at 3★ (≈87-89%). Two ≈66-74%; three ≈49% (≈3% if contested). Best number: 1, a second only if uncontested.'),
        ('3-cost reroll', '1 target only, and it is unreliable by 5-2 (≈38% at level 7). Treat a 3-cost 3★ as a bonus, not the plan.'),
        ('Fast 8', 'One 4-cost 2★ carry plus a 4-cost 2★ tank (≈89% / ≈84%). Two 4-cost 2★ carries ≈75%. v36 XP (7→8 36, 8→9 56) helps Fast 8 slightly.'),
        ('Frontline', 'A 4-cost 2★ tank at level 5-6 shows up in only ≈2-26% of games: plan a 3-cost 2★ or 1-cost 3★ tank instead.')]
ws.cell(row=b + 2, column=1, value='Best number of targets').font = BOLD
for i, (k, v) in enumerate(recs):
    ws.cell(row=b + 3 + i, column=1, value=k).font = BOLD; ws.cell(row=b + 3 + i, column=2, value=v).font = BODY

# 3. Per composition
ws = wb.create_sheet('Per composition')
strat = {'r12': 'Reroll 1-2 cost (roll at 6, level 7)', 'r12s': 'Reroll 1-2 cost (stay 6)', 'r1': 'Reroll 1-cost (roll at 5)', 'r2': 'Reroll 2-cost (roll at 6)', 'r3': 'Reroll 3-cost (roll at 7)', 'f8': 'Fast 8'}
rows = []
for c in analysis['comps']:
    for v in sorted(c['variants'], key=lambda v: -v['expected']):
        a_ = v['acq']; o, ct, w, l = a_['open'], a_['contested'], a_['win'], a_['lose']
        targets = ' + '.join(name(x, 3 if c['strat'] != 'f8' else 2) for x in [c['line']] + v['extras'])
        r = len(rows) + 5
        rows.append([name(c['line'], 3 if c['strat'] != 'f8' else 2), strat[c['strat']], targets, v['traits'], 'steady (extras at 2★)' if v.get('steady') else 'as searched',
                     v['pHit'], ct['core'], w['core'], l['core'], o['tank'], o['full'], o['rollGold'], f'=L{r}/2', o['unitGold'], o['xpGold'], f'=L{r}+N{r}+O{r}',
                     o['rollGoldMedianOnHit'], o['medianDone'], o['level'], o['goldLeft'], v['final']['score'], v['lowBest']['score'], v['expected']])
a, b = sheet(ws, 'Per composition: gold used and rolls needed to finish by 5-2',
  'Exact board needs (carry and extra targets at 3★, others at their shown stars) simulated from 1-1 with that strategy\'s level curve and best roll policy (3-cost rerolls: the better of level 7 at 4-1 or at 3-5), 300 games (mixed), 150 per other profile. "Full board" = every unit at its shown star. Expected 5-2 = the boards actually held at 5-2 in 200 simulated games (copies found, level reached), fought and weighted by frequency (this sets the website tier). Core hit = every 3★ target found.',
  ['Carry', 'Strategy', '3★ targets', 'Traits', 'Variant', 'Core hit by 5-2', 'Core hit, contested', 'Core hit, win-streak', 'Core hit, lose-streak', 'Tank at shown star', 'Full board', 'Avg roll gold', 'Avg rolls', 'Avg unit gold', 'Avg XP gold', 'Avg total spent', 'Median roll gold when hit', 'Median hit round', 'Avg level 5-2', 'Avg gold left 5-2', 'Full-board combat', 'Low-roll combat', 'Expected 5-2 (realized boards)'],
  rows, [I, I, I, I, I, P, P, P, P, P, P, G0, G0, G0, G0, G0, G0, I, '0.00', G0, P, P, P], [14, 22, 26, 34, 18, 10, 10, 10, 10, 10, 9, 9, 8, 9, 8, 10, 11, 9, 8, 9, 10, 10, 10])
ws.auto_filter.ref = f'A4:W{b}'

# 4. Policy grid
ws = wb.create_sheet('Policy grid')
rows = [[c['type'], c['k'], c['level'], g['from'], g['floor'], g['allIn'], g['hit'], g['tank4'], g['rollGold']] for c in budget['configs'] for g in c['grid']]
sheet(ws, 'Roll policy grid (200 games each, mixed profile)', '"early" = start rolling the round the roll level is reached; "late" = two rounds later. Floor = gold kept while slow-rolling; from the all-in round the floor is 0.',
  ['Plan', 'Targets', 'Roll level', 'Start', 'Floor gold', 'All-in round', 'Hit by 5-2', '4-cost tank 2★', 'Avg roll gold'], rows, [I, G0, G0, I, G0, I, P, P, G0], [20, 8, 9, 8, 9, 10, 10, 11, 11])
ws.auto_filter.ref = f'A4:I{4 + len(rows)}'

# 5. Seals (measured economy effect)
prog_file = W / 'progression.json'
if prog_file.exists():
    prog = json.loads(prog_file.read_text())['rows']
    seals_by = {}
    sd = (Path(__file__).resolve().parents[2] / 'seals-data.js').read_text()
    sd = json.loads(sd[sd.index('{'):sd.rindex('}') + 1])
    sname = {s['id']: s['name'] for s in sd['seals']}
    rows, seen = [], set()
    for rid, p in prog.items():
        carry = rid.split('-')[1]
        for m in p.get('sealMeasured', []):
            key = (carry, m['round'], m['id'])
            if key in seen: continue
            seen.add(key); r = len(rows) + 5
            rows.append([carry, ['2-1', '3-2', '4-2'][m['round']], sname.get(m['id'], m['id']), m['base'], m['with'], f'=E{r}-D{r}'])
    rows.sort(key=lambda x: (x[0], x[1], -(x[4] - x[3])))
    for i, row in enumerate(rows): row[5] = f'=E{i + 5}-D{i + 5}'
    ws = wb.create_sheet('Seals (economy)')
    sheet(ws, 'Economy and shop Seals: effect on finishing the board by 5-2',
      'Each Seal is added at its round on top of the Seals already picked earlier in that composition\'s plan, 160 full-game simulations (mixed profile). Combat Seals are not in this table: they are ranked by board fit on the website.',
      ['Carry line', 'Round', 'Seal', 'Hit by 5-2 without', 'Hit by 5-2 with', 'Change'], rows, [I, I, I, P, P, '+0.0%;-0.0%;0.0%'], [14, 8, 22, 14, 14, 10])
    ws.auto_filter.ref = f'A4:F{4 + len(rows)}'

# 6. GPT backup boards vs this run, same lobby and seeds
gpt_file = W / 'gpt-compare.json'
if gpt_file.exists():
    import re
    gpt = json.loads(gpt_file.read_text())
    html = (Path(__file__).resolve().parents[2] / 'compositions.html').read_text()
    ours = json.loads(re.search(r'window\.KANTO_COMPS=(\{[^\n]*\});', html).group(1))['rows']
    best = {}
    for r in ours: best.setdefault(r['carry'], r)
    rows = []
    for g in gpt:
        o = best.get(g['carry']); r = len(rows) + 5
        rows.append([g['name'], g['strategy'], g['tier'], g['theirScore'], g['ourLobbyScore'], o['name'] if o else 'not in this run', o['strategy'] if o else '', o['tier'] if o else '', o['score'] if o else None, f'=IF(I{r}="","",I{r}-E{r})', o['expected'] if o else None])
    ws = wb.create_sheet('GPT vs this run')
    sheet(ws, 'GPT v36 boards (backup page) vs this run, same carry',
      'GPT boards are scored exactly as published (units, stars, items, cells) against this run\'s lobby with 8 seeds on both sides. "Their score" is GPT\'s own number on its 18-board lobby. Our board is the lead build for the same carry.',
      ['GPT board', 'GPT strategy', 'GPT tier', 'Their score (their lobby)', 'GPT board on our lobby', 'Our board', 'Our strategy', 'Our tier', 'Our full board', 'Difference', 'Our expected 5-2'],
      rows, [I, I, I, P, P, I, I, I, P, '+0.0%;-0.0%;0.0%', P], [24, 16, 8, 12, 12, 24, 16, 8, 11, 10, 11])

# 7. Toongcha boards (brother's list) on the same lobby and 5-2 model
bro_file = W / 'brother' / 'compare.json'
if bro_file.exists():
    bro = json.loads(bro_file.read_text())
    rows = []
    for b in sorted(bro['theirs'], key=lambda b: -b['expected']):
        r = len(rows) + 5
        rows.append([b['name'], b['set'], b.get('tier') or '', (b['theirWr'] or 0) / 100, b['score'], b['reach'], b['expected'], b['lowScore'], b['traits']])
    ws = wb.create_sheet('Toongcha boards')
    sheet(ws, "Toongcha v36 boards on this run's lobby",
      'Exact boards (units, stars, items, cells). Full board: 16 seeds on both sides vs the 18+18 lobby. Reach: share of 300 simulated games with every 3★ target and the level by 5-2. Expected 5-2: the realized boards actually held at 5-2, fought and weighted (same model as our list). Their win rate is their own site number on their own lobby.',
      ['Board', 'Their list', 'Their tier', 'Their win rate', 'Full board (our lobby)', 'Everything by 5-2', 'Expected 5-2', 'All targets one star lower', 'Traits'],
      rows, [I, I, I, P, P, P, P, P, I], [28, 8, 8, 11, 12, 12, 11, 12, 40])
    rows = []
    names = {b['id']: b['name'] for b in bro['theirs']}
    for m in bro['matrix']:
        avg = sum(x['score'] for x in m['vs']) / len(m['vs']); worst = min(m['vs'], key=lambda x: x['score'])
        rows.append([m['name'], m['tier'], m['expected'], avg, names[worst['id']], worst['score']])
    ws = wb.create_sheet('Ours vs Toongcha')
    sheet(ws, 'Our lead builds vs every Toongcha board, full boards head to head',
      '16 fights per pair (8 seeds on both sides). Full boards on both sides, so greedy boards with many 3★ units look stronger here than they are at 5-2 on average.',
      ['Our build', 'Our tier', 'Our expected 5-2', 'Average vs their 16 boards', 'Worst matchup', 'Worst score'], rows, [I, I, P, P, I, P], [28, 8, 12, 14, 28, 10])

# 8. Rules
ws = wb.create_sheet('Rules used')
rules = [('Start gold / level', '5 gold, level 2'), ('Base income', '5 per round (not on 1-1 or carousel rounds)'), ('Interest', '1 per 10 gold held, max 5'),
         ('Streak gold', '+1 at 2, +2 at 3, +3 at 5 (win or loss)'), ('PvP win gold', '+1'), ('PvE gold', '2-8 win +3; any stage PvE loss +2'),
         ('Reroll', '2 gold'), ('Buy XP', '4 gold for 4 XP'), ('Passive XP', '+2 per round except carousel'), ('XP to next level', '2→3: 4, 3→4: 8, 4→5: 12, 5→6: 16, 6→7: 24, 7→8: 36, 8→9: 56 (v36)'),
         ('Shop odds (1/2/3/4/5-cost %)', 'L4 65/30/5/0/0 · L5 58/32/9/1/0 · L6 42/40/15/3/0 · L7 22/32/34/12/0 · L8 14/22/32/26/6 · L9 5/12/26/35/22'),
         ('Copies per line', '1-cost 29, 2-cost 22, 3-cost 18, 4-cost 10, 5-cost 9'), ('Rounds to 5-2', '1-1…1-3, then 8 per stage (2-4, 3-4, 4-4 carousel; 2-8, 3-8, 4-8 PvE), 5-1, 5-2'),
         ('Eevee', 'Vaporeon needs 9 Eevee copies (2-cost pool shared with Jolteon/Flareon players)'), ('Source', 'Public Kanto Tactics v36 build (shop/route modules), read 25 Oct 2026; v36 engine in simulation/engine-v36.js; meta API generated ' + budget.get('generated', '')[:10])]
ws['A1'] = 'Economy rules used in the simulation'; ws['A1'].font = TITLE
for i, (k, v) in enumerate(rules, 3):
    ws.cell(row=i, column=1, value=k).font = BOLD; ws.cell(row=i, column=2, value=v).font = BODY
ws.column_dimensions['A'].width = 30; ws.column_dimensions['B'].width = 110
wb.save(out); print(out)
