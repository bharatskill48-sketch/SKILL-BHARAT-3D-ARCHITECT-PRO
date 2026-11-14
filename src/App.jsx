
import React, { useEffect, useRef, useState } from 'react';
import { firebaseEnabled } from './firebase';

const KEY = 'sbe-architect-project-v1';

const starter = [
  { id: 'a', name: 'Living Room', x: 100, y: 90, w: 260, h: 180, color: '#dbeafe' },
  { id: 'b', name: 'Bedroom 1', x: 390, y: 90, w: 180, h: 150, color: '#fce7f3' },
  { id: 'c', name: 'Kitchen', x: 100, y: 310, w: 180, h: 130, color: '#dcfce7' }
];

const saveFile = (blob, name) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

export default function App() {
  const [rooms, setRooms] = useState(starter);
  const [selected, setSelected] = useState('a');
  const [projectName, setProjectName] = useState('My First House');
  const [status, setStatus] = useState('Ready');
  const [drag, setDrag] = useState(null);
  const svg = useRef(null);

  const chosen = rooms.find(room => room.id === selected);

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem(KEY));
      if (data) {
        setRooms(data.rooms || starter);
        setProjectName(data.name || 'My First House');
      }
    } catch {}
  }, []);

  const update = (key, value) => {
    setRooms(previous =>
      previous.map(room =>
        room.id === selected
          ? {
              ...room,
              [key]: ['x', 'y', 'w', 'h'].includes(key)
                ? Math.max(key === 'w' || key === 'h' ? 40 : 0, Number(value) || 0)
                : value
            }
          : room
      )
    );
  };

  const save = () => {
    localStorage.setItem(KEY, JSON.stringify({
      name: projectName,
      rooms
    }));
    setStatus('Saved on this device');
  };

  const addRoom = () => {
    const id = 'r' + Date.now();
    setRooms(previous => [
      ...previous,
      { id, name: 'New Room', x: 130, y: 180, w: 170, h: 130, color: '#fef3c7' }
    ]);
    setSelected(id);
    setStatus('Room added');
  };

  const getPosition = event => {
    const bounds = svg.current.getBoundingClientRect();
    return {
      x: (event.clientX - bounds.left) * 900 / bounds.width,
      y: (event.clientY - bounds.top) * 600 / bounds.height
    };
  };

  const startDrag = (event, room) => {
    event.stopPropagation();
    const position = getPosition(event);
    setSelected(room.id);
    setDrag({
      id: room.id,
      dx: position.x - room.x,
      dy: position.y - room.y
    });
  };

  const moveRoom = event => {
    if (!drag) return;
    const position = getPosition(event);

    setRooms(previous =>
      previous.map(room =>
        room.id === drag.id
          ? {
              ...room,
              x: Math.max(0, Math.min(900 - room.w, position.x - drag.dx)),
              y: Math.max(0, Math.min(600 - room.h, position.y - drag.dy))
            }
          : room
      )
    );
  };

  const downloadProject = () => {
    const data = JSON.stringify({ name: projectName, rooms }, null, 2);
    saveFile(
      new Blob([data], { type: 'application/json' }),
      (projectName || 'project') + '.sbe.json'
    );
  };

  const exportSVG = () => {
    const copy = svg.current.cloneNode(true);
    copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    saveFile(
      new Blob([new XMLSerializer().serializeToString(copy)], {
        type: 'image/svg+xml'
      }),
      'floor-plan.svg'
    );
  };

  const importProject = event => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data.rooms)) throw new Error();

        setRooms(data.rooms);
        setProjectName(data.name || 'Imported Project');
        setSelected(data.rooms[0]?.id || null);
        setStatus('Project imported');
      } catch {
        setStatus('Invalid project file');
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="app">
      <header>
        <div className="logo">SB</div>

        <div>
          <b>SKILL BHARAT <span>3D ARCHITECT PRO</span></b>
          <small>Easy Home Design Studio · Step 1: 2D Editor</small>
        </div>

        <label className="mode">
          {firebaseEnabled ? 'Firebase configured' : 'Local mode'}
        </label>

        <button className="primary" onClick={save}>
          Save Project
        </button>
      </header>

      <main>
        <aside>
          <h4>TOOLS</h4>
          <button onClick={addRoom}>＋ Add Room</button>
          <button onClick={exportSVG}>⇩ Export SVG</button>

          <label className="upload">
            ⇧ Import Project
            <input type="file" accept=".json" onChange={importProject} />
          </label>

          <p className="tip">
            Tip: Select a room and drag it. Edit its size and color in Properties.
          </p>

          <small>COMING NEXT</small>
          <p className="muted">
            Doors & Windows<br />
            3D View<br />
            Furniture Library
          </p>
        </aside>

        <section className="editor">
          <div className="bar">
            <div>
              <small>PROJECT NAME</small>
              <input
                value={projectName}
                onChange={event => setProjectName(event.target.value)}
              />
            </div>

            <button onClick={downloadProject}>Download Project</button>

            <button onClick={() => {
              setRooms(starter);
              setSelected('a');
              setStatus('Demo restored');
            }}>
              Reset Demo
            </button>
          </div>

          <div className="board">
            <div className="caption">
              2D FLOOR PLAN <span>Grid · design units</span>
            </div>

            <svg
              ref={svg}
              viewBox="0 0 900 600"
              onPointerMove={moveRoom}
              onPointerUp={() => setDrag(null)}
              onPointerLeave={() => setDrag(null)}
              onPointerDown={() => setSelected(null)}
            >
              <defs>
                <pattern id="g" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M20 0H0V20" fill="none" stroke="#e5eaf1" />
                </pattern>
              </defs>

              <rect width="900" height="600" fill="white" />
              <rect width="900" height="600" fill="url(#g)" />

              {rooms.map(room => (
                <g
                  key={room.id}
                  onPointerDown={event => startDrag(event, room)}
                  style={{ cursor: 'grab' }}
                >
                  <rect
                    x={room.x}
                    y={room.y}
                    width={room.w}
                    height={room.h}
                    fill={room.color}
                    stroke={room.id === selected ? '#2563eb' : '#27364b'}
                    strokeWidth={room.id === selected ? 5 : 4}
                  />

                  <text
                    x={room.x + room.w / 2}
                    y={room.y + room.h / 2 - 7}
                    textAnchor="middle"
                    fontSize="17"
                    fontWeight="600"
                    fill="#26364b"
                    pointerEvents="none"
                  >
                    {room.name}
                  </text>

                  <text
                    x={room.x + room.w / 2}
                    y={room.y + room.h / 2 + 17}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#64748b"
                    pointerEvents="none"
                  >
                    {room.w} × {room.h}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <footer>
            ● {status}
            <span>{rooms.length} rooms</span>
          </footer>
        </section>

        <aside className="properties">
          <h4>PROPERTIES</h4>

          {chosen ? (
            <>
              <label>Room name</label>
              <input
                value={chosen.name}
                onChange={event => update('name', event.target.value)}
              />

              <div className="grid">
                {['w', 'h', 'x', 'y'].map(key => (
                  <div key={key}>
                    <label>
                      {{ w: 'Width', h: 'Height', x: 'X position', y: 'Y position' }[key]}
                    </label>

                    <input
                      type="number"
                      value={chosen[key]}
                      onChange={event => update(key, event.target.value)}
                    />
                  </div>
                ))}
              </div>

              <label>Room color</label>
              <input
                type="color"
                value={chosen.color}
                onChange={event => update('color', event.target.value)}
              />

              <button
                className="delete"
                onClick={() => {
                  setRooms(previous => previous.filter(room => room.id !== selected));
                  setSelected(null);
                }}
              >
                Delete Room
              </button>
            </>
          ) : (
            <p className="muted">Select a room on the plan to edit it.</p>
          )}

          <p className="tip">
            This is the first 2D prototype. 3D, doors, windows, furniture and cloud sync are later steps.
          </p>
        </aside>
      </main>

      <div className="mobile">
        Tip: Turn your phone sideways for a wider workspace.
      </div>
    </div>
  );
                          }
