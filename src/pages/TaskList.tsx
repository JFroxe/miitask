import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    collection,
    addDoc,
    getDocs,
	getDoc,
    updateDoc,
    doc,
    deleteDoc,
    Timestamp,
} from "firebase/firestore";
import { db, auth } from "../pages/firebaseConfig";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Estilos mejorados (sin cambios en esta sección)
const Container = styled.div`
    max-width: 1300px;
    margin: 40px auto;
    padding: 30px;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
`;

const Title = styled.h2`
    font-size: 2.8rem;
    margin-bottom: 25px;
    color: #222;
`;

const LogoutLink = styled.span`
    display: inline-block;
    margin-left: auto;
    color: #dc3545;
    font-weight: 600;
    cursor: pointer;
    padding: 6px 12px;
    border-radius: 6px;
    background-color: rgba(220, 53, 69, 0.1);
    transition: background-color 0.2s ease;
    font-size: 0.95rem;

    &:hover {
        background-color: rgba(220, 53, 69, 0.2);
    }
`;

const TopBar = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
`;

const Button = styled.button`
    padding: 10px 18px;
    border: none;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.2s ease-in-out;
    margin-right: 10px;
    margin-bottom: 10px;

    &.add {
        background-color: #28a745;
        color: white;

        &:hover {
            background-color: #218838;
        }
    }

    &.cancel {
        background-color: #6c757d;
        color: white;

        &:hover {
            background-color: #5a6268;
        }
    }

    &.delete {
        background-color: #dc3545;
        color: white;

        &:hover {
            background-color: #c82333;
        }
    }
`;

const FilterButton = styled.button`
    padding: 10px;
    margin: 5px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s;
    
    &:hover {
        background: #0056b3;
    }
`;

const CloseButton = styled.button`
    background: red;
    color: white;
    padding: 8px;
    border: none;
    cursor: pointer;
    border-radius: 5px;
`;

const ModalContent = styled.div`
    background-color: white;
    padding: 30px 40px;
    border-radius: 10px;
    width: 600px;
    max-height: 90vh;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: #eee;
    }

    &::-webkit-scrollbar-thumb {
        background-color: #bbb;
        border-radius: 5px;
    }

    &::-webkit-scrollbar-thumb:hover {
        background-color: #999;
    }
`;

const ModalForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 15px;
`;

const ModalInput = styled.input`
    padding: 10px;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 5px;
`;

const ModalDate = styled.div`
    padding: 10px;
	margin-right: 8px;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 5px;
`;

const ModalSelect = styled.select`
    padding: 10px;
    font-size: 1rem;
    border-radius: 5px;
    border: 1px solid #ccc;
`;

const TaskStatusSelect = styled.select`
    padding: 8px 12px;
	margin-left: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    border: 1px solid #ccc;
    border-radius: 8px;
    background-color: #ffffff;
    color: #333;
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
    transition: all 0.2s ease;

    &:hover {
        border-color: #888;
    }

    &:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    option {
        font-weight: normal;
        background: #fff;
    }
`;

const ModalLabel = styled.label`
    font-weight: 600;
    color: #333;
`;

const TaskItem = styled.div`
    display: flex;
    flex-direction: column;
    background-color: #fdfdfd;
    border-left: 5px solid #007bff;
    padding: 15px 20px;
    border-radius: 10px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    position: relative;
    z-index: 0;

    &:nth-child(even) {
        background-color: #f5f5f5;
    }
`;

const TaskSection = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 8px;
    font-size: 0.95rem;
    align-items: center; /* Intenta centrar verticalmente en cada línea */

    & > span {
        min-width: 140px;
        color: #333;
    }
`;

const TaskHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
    font-size: 1rem;
    margin-bottom: 10px;

    & > span:first-child {
        color: #007bff;
    }

    & > span:last-child {
        background-color: #eee;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.9rem;
    }
`;

const DeletePopup = styled.div`
    position: absolute;
    top: 5px;
    right: 5px;
    background: white;
    padding: 10px;
    border-radius: 6px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    z-index: 100;
`;

const ModalOverlay = styled.div`
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    animation: fadeIn 0.3s ease;
    z-index: 1000;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

interface Tag {
    id: string;
    nombre: string;
    color: string;
}

interface EquipoVenta {
    marca: string;
    modelo: string;
    imei?: string;
}

interface Fechas {
    inicio?: Date | null;
    final?: Date | null;
    venta?: Date | null;
}

interface WorkItem {
    id: string;
    type: "reparacion" | "venta";
    referencia: string;
    descripcion?: string;
    equipo?: string | EquipoVenta;
    fechas?: Fechas;
    estado?: "pendiente" | "en progreso" | "completada" | "vendido" | "eliminar";
    montoCliente?: number;
    manoObra?: number;
    comision?: number;
    cliente?: string;
    modalidad?: "De Contado" | "Apartado" | "A Crédito";
    fechaCreacion: Date;
    userId: string;
	tags?: string[];
}

const TaskList: React.FC = () => {
    const [shareName, setShareName] = useState<string>(auth.currentUser?.displayName || '');
    const navigate = useNavigate();
    const [workItems, setWorkItems] = useState<WorkItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [newType, setNewType] = useState<WorkItem["type"]>("reparacion");
    const [newReferencia, setNewReferencia] = useState("");
    const [newDescripcion, setNewDescripcion] = useState("");
    const [newEquipoReparacion, setNewEquipoReparacion] = useState("");
    const [newFechaInicio, setNewFechaInicio] = useState<Date | null>(null);
    const [newFechaFinal, setNewFechaFinal] = useState<Date | null>(null);
    const [newFechaVenta, setNewFechaVenta] = useState<Date | null>(null);
    const [newEstado, setNewEstado] = useState<WorkItem["estado"]>("pendiente");
    const [newMontoClienteReparacion, setNewMontoClienteReparacion] = useState<number | undefined>();
    const [newManoObra, setNewManoObra] = useState<number | undefined>();
    const [newClienteVenta, setNewClienteVenta] = useState("");
    const [newEquipoVentaMarca, setNewEquipoVentaMarca] = useState("");
    const [newEquipoVentaModelo, setNewEquipoVentaModelo] = useState("");
    const [newEquipoVentaIMEI, setNewEquipoVentaIMEI] = useState<string | undefined>();
    const [newModalidadVenta, setNewModalidadVenta] = useState<WorkItem["modalidad"]>("De Contado");
    const [newMontoClienteVenta, setNewMontoClienteVenta] = useState<number | undefined>();
    const [newComisionVenta, setNewComisionVenta] = useState<number | undefined>();
    const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
    const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
const [availableTags, setAvailableTags] = useState<Tag[]>([
        { id: 'pendiente', nombre: 'Pendiente', color: '#f44336' },
        { id: 'pagado', nombre: 'Pagado', color: '#4caf50' },
        { id: 'facturado', nombre: 'Facturado', color: '#ff9800' },
    ]);


    const [newTags, setNewTags] = useState<string[]>([]);
    const [modalDetailTags, setModalDetailTags] = useState<string[]>([]);

    const setSelectedItemHandler = (item: WorkItem | null) => {
        setSelectedItem(item);
        setModalDetailTags("");
    };

    const handleModalDetailTagChange = (tagId: string) => {
        setModalDetailTags(newTags[0] === tagId ? [] : [tagId]); // Si ya está seleccionada, deselecciona; sino, selecciona esta y deselecciona las demás
    };

    const saveItemTags = async (itemId: string, tags: string[]) => {
        const user = auth.currentUser;
        if (user) {
            const workItemDocRef = doc(db, "users", user.uid, "workItems", itemId);
            try {
                await updateDoc(workItemDocRef, { tags: tags });
                setWorkItems(
                    workItems.map(item =>
                        item.id === itemId ? { ...item, tags: tags } : item
                    )
                );
                setSelectedItem(prev => prev ? { ...prev, tags: tags } : null);
            } catch (error: any) {
                console.error("Error al guardar las etiquetas:", error.message);
                alert("No se pudieron guardar las etiquetas.");
            } finally {
                setSelectedItem(null);
				setNewTags([]);
            }
        } else {
            alert("Debes estar logueado para guardar etiquetas.");
        }
    };


const formatDateForInput = (date: Date | null): string => {
    if (!date) return "";
    return date.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });
};


    const fetchUserWorkItems = useCallback(async () => {
        const user = auth.currentUser;
        if (user) {
            const userWorkItemsCollection = collection(db, "users", user.uid, "workItems");
            const querySnapshot = await getDocs(userWorkItemsCollection);
            const itemList = querySnapshot.docs.map((doc) => {
                const data = doc.data();
                const fechas: Fechas = {};
                if (data.fechas) {
                    fechas.inicio = data.fechas.inicio ? (data.fechas.inicio as Timestamp).toDate() : null;
                    fechas.final = data.fechas.final ? (data.fechas.final as Timestamp).toDate() : null;
                    fechas.venta = data.fechas.venta ? (data.fechas.venta as Timestamp).toDate() : null;
                }
                return { id: doc.id, ...data, fechaCreacion: (data.fechaCreacion as Timestamp).toDate(), userId: data.userId as string, fechas: fechas } as WorkItem;
            });
            // Ordena la lista (si es necesario)
            itemList.sort((a, b) => {
                const inicioA = a.type === 'reparacion' && a.fechas?.inicio ? a.fechas.inicio.getTime() : -Infinity;
                const inicioB = b.type === 'reparacion' && b.fechas?.inicio ? b.fechas.inicio.getTime() : -Infinity;
                if (inicioA === inicioB) {
                    return b.fechaCreacion.getTime() - a.fechaCreacion.getTime();
                }
                return inicioA - inicioB;
            });
            setWorkItems(itemList);
        } else {
            navigate("/login");
        }
    }, [navigate]); // Agrega navigate como dependencia si es necesario

    useEffect(() => {
        fetchUserWorkItems();
        // ... (tu lógica para onAuthStateChanged) ...
    }, [fetchUserWorkItems]); // Usa fetchUserWorkItems como dependencia

const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (date: Date | null) => void) => {
    const value = e.target.value;
    const selectedDate = value ? new Date(value) : null;

    if (selectedDate) {
        // Ajustar la fecha sumando un día (en milisegundos)
        const adjustedDate = new Date(selectedDate.getTime() + (24 * 60 * 60 * 1000));
        setter(adjustedDate);
    } else {
        setter(null);
    }
};

    useEffect(() => {
        const fetchUserWorkItems = async () => {
            const user = auth.currentUser;
            if (user) {
                const userWorkItemsCollection = collection(db, "users", user.uid, "workItems");
                const querySnapshot = await getDocs(userWorkItemsCollection);
                const itemList = querySnapshot.docs.map((doc) => {
                    const data = doc.data();
                    const fechas: Fechas = {};
                    if (data.fechas) {
                        fechas.inicio = data.fechas.inicio ? (data.fechas.inicio as Timestamp).toDate() : null;
                        fechas.final = data.fechas.final ? (data.fechas.final as Timestamp).toDate() : null;
                        fechas.venta = data.fechas.venta ? (data.fechas.venta as Timestamp).toDate() : null;
                    }
                    return {
                        id: doc.id,
                        ...data,
                        fechaCreacion: (data.fechaCreacion as Timestamp).toDate(),
                        userId: data.userId as string,
                        fechas: fechas,
                    } as WorkItem;
                });

                itemList.sort((a, b) => {
                    const inicioA = a.type === 'reparacion' && a.fechas?.inicio ? a.fechas.inicio.getTime() : -Infinity;
                    const inicioB = b.type === 'reparacion' && b.fechas?.inicio ? b.fechas.inicio.getTime() : -Infinity;

                    if (inicioA === inicioB) {
                        return b.fechaCreacion.getTime() - a.fechaCreacion.getTime();
                    }
                    return inicioA - inicioB;
                });
                setWorkItems(itemList);
            } else {
                navigate("/login");
            }
        };

        fetchUserWorkItems();

        const unsubscribeAuth = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchUserWorkItems();
            } else {
                setWorkItems([]);
            }
        });

        return () => unsubscribeAuth();
    }, [navigate]);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setNewType("reparacion");
        setNewReferencia("");
        setNewDescripcion("");
        setNewEquipoReparacion("");
        setNewFechaInicio(null);
        setNewFechaFinal(null);
        setNewEstado("pendiente");
        setNewMontoClienteReparacion("");
        setNewManoObra("");
        setNewClienteVenta("");
        setNewEquipoVentaMarca("");
        setNewEquipoVentaModelo("");
        setNewEquipoVentaIMEI("");
        setNewModalidadVenta("De Contado");
        setNewMontoClienteVenta("");
        setNewComisionVenta("");
        setNewFechaVenta(null);
		setNewTags([]);
    };

const handleTagChange = (tagId: string) => {
    setNewTags(newTags[0] === tagId ? [] : [tagId]); // Si ya está seleccionada, deselecciona; sino, selecciona esta y deselecciona las demás
};
	
    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setNewType(e.target.value as WorkItem["type"]);
        setNewReferencia("");
    };

    const handleReferenciaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewReferencia(e.target.value);
    };

    const addWorkItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newReferencia.trim() === "") return;

        const user = auth.currentUser;
        if (user) {
            let formattedReferencia = newReferencia;
            if (newType === "reparacion") {
                formattedReferencia = `ORD 000${newReferencia}`;
            } else if (newType === "venta") {
                formattedReferencia = `ORD 000${newReferencia}`;
            }

            const newItemData = {
                type: newType,
                cliente: newType === "venta" ? newClienteVenta : "",
                referencia: formattedReferencia,
                descripcion: newType === "reparacion" ? newDescripcion : "",
                equipo: newType === "reparacion" ? newEquipoReparacion : {
                    marca: newEquipoVentaMarca,
                    modelo: newEquipoVentaModelo,
                    imei: newEquipoVentaIMEI,
                },
                fechas: {
                    inicio: newFechaInicio ? Timestamp.fromDate(newFechaInicio) : null,
                    final: newFechaFinal ? Timestamp.fromDate(newFechaFinal) : null,
                    venta: newFechaVenta ? Timestamp.fromDate(newFechaVenta) : null,
                },
                estado: newType === "reparacion" ? newEstado : "vendido",
                montoCliente: newType === "reparacion" ? newMontoClienteReparacion : newMontoClienteVenta,
                manoObra: newType === "reparacion" ? newManoObra : "",
				modalidad: newType === "venta" ? newModalidadVenta : "",
                comision: newType === "venta" ? newComisionVenta : "",
                fechaCreacion: Timestamp.now(),
                userId: user.uid,
				tags: newTags,
            };

            const userWorkItemsCollection = collection(db, "users", user.uid, "workItems");
            const docRef = await addDoc(userWorkItemsCollection, newItemData);

            // Actualizar el estado local inmediatamente
            setWorkItems([
                ...workItems,
                {
                    id: docRef.id,
                    ...newItemData,
                    fechaCreacion: new Date(), // Usamos la fecha actual para la UI
                } as WorkItem,
            ]);
			
			fetchUserWorkItems();
            closeModal();
        } else {
            alert("Debes estar logueado para agregar trabajos.");
        }
    };

    const handleStatusChange = (id: string, newStatus: WorkItem["estado"]) => {
        if (newStatus === "eliminar") {
            setItemToDelete(id);
        } else if (itemToDelete === id) {
            setItemToDelete(null);
        } else if (newStatus !== "eliminar") {
            updateWorkItemStatusInFirestore(id, newStatus);
        }
    };

    const updateWorkItemStatusInFirestore = async (id: string, newStatus: WorkItem["estado"]) => {
        const user = auth.currentUser;
        if (user) {
            const workItemDocRef = doc(db, "users", user.uid, "workItems", id);
            try {
                await updateDoc(workItemDocRef, { estado: newStatus });
                setWorkItems(
                    workItems.map((item) =>
                        item.id === id && item.type === "reparacion" ? { ...item, estado: newStatus } : item
                    )
                );
            } catch (error: any) {
                console.error("Error al actualizar el estado:", error.message);
                alert("No se pudo actualizar el estado. Verifica tu conexión y permisos.");
            }
        } else {
            alert("Debes estar logueado para actualizar trabajos.");
        }
    };

const confirmDelete = (id: string) => {
    deleteWorkItem(id);
    setItemToDelete(null);
};


    const deleteWorkItem = async (id: string) => {
        const user = auth.currentUser;
        if (user) {
            try {
                const workItemDocRef = doc(db, "users", user.uid, "workItems", id);
                await deleteDoc(workItemDocRef);
                setWorkItems(workItems.filter((item) => item.id !== id));
            } catch (error: any) {
                console.error("Error al eliminar el trabajo:", error.message);
                alert("No se pudo eliminar el trabajo. Verifica tu conexión y permisos.");
            }
        } else {
            alert("Debes estar logueado para eliminar trabajos.");
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/login");
        } catch (error: any) {
            console.error("Error al cerrar sesión:", error.message);
        }
    };

const filteredWorkItems = useMemo(() => {
    if (!filterStartDate) {
        return [...workItems].sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime()); // Mostrar los nuevos arriba por defecto
    }

    const filtered = workItems.filter(item => {
        const filterDate = new Date(filterStartDate.getFullYear(), filterStartDate.getMonth(), filterStartDate.getDate());

        if (item.type === 'reparacion' && item.fechas?.inicio) {
            const itemStartDate = new Date(item.fechas.inicio.getFullYear(), item.fechas.inicio.getMonth(), item.fechas.inicio.getDate());
            return itemStartDate.getTime() === filterDate.getTime();
        }

        if (item.type === 'venta' && item.fechas?.venta) {
            const itemSaleDate = new Date(item.fechas.venta.getFullYear(), item.fechas.venta.getMonth(), item.fechas.venta.getDate());
            return itemSaleDate.getTime() === filterDate.getTime();
        }

        return true; // Si no coincide con el tipo y la fecha, no se filtra (se muestra si no hay filtro)
    });

    return filtered.sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime()); // Mostrar los nuevos arriba en los resultados filtrados
}, [workItems, filterStartDate]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = useMemo(() => filteredWorkItems.slice(indexOfFirstItem, indexOfLastItem), [filteredWorkItems, currentPage, itemsPerPage]);

    const totalPages = useMemo(() => Math.ceil(filteredWorkItems.length / itemsPerPage), [filteredWorkItems, itemsPerPage]);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const goToAllView = () => {
        setFilterStartDate(null);
        setCurrentPage(1);
    };

const shareFilteredOnWhatsApp = () => {
        if (filterStartDate) {
            const formatDate = (date: Date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const formattedFilterDate = formatDate(filterStartDate);
            const trabajosDelDia = workItems.filter(item => {
                const filterDate = new Date(filterStartDate.getFullYear(), filterStartDate.getMonth(), filterStartDate.getDate());
                if (item.type === 'reparacion' && item.fechas?.inicio) {
                    const itemStartDate = new Date(item.fechas.inicio.getFullYear(), item.fechas.inicio.getMonth(), item.fechas.inicio.getDate());
                    return itemStartDate.getTime() === filterDate.getTime();
                }
                if (item.type === 'venta' && item.fechas?.venta) {
                    const itemSaleDate = new Date(item.fechas.venta.getFullYear(), item.fechas.venta.getMonth(), item.fechas.venta.getDate());
                    return itemSaleDate.getTime() === filterDate.getTime();
                }
                return false; // Solo incluir reparaciones o ventas con la fecha seleccionada
            });

            if (trabajosDelDia.length > 0) {
                let message = `Trabajos del día ${formattedFilterDate}:\n\n`;
                const nameToUse = shareName; // Usar el valor del estado shareName

                trabajosDelDia.forEach(trabajo => {
                    let equipoInfo = 'N/A';
                    if (trabajo.type === 'venta' && typeof trabajo.equipo === 'object') {
                        equipoInfo = `${(trabajo.equipo as EquipoVenta).marca} ${(trabajo.equipo as EquipoVenta).modelo} (${(trabajo.equipo as EquipoVenta).imei || 'Sin IMEI'})`;
                    } else if (trabajo.type === 'reparacion' && trabajo.equipo) {
                        equipoInfo = trabajo.equipo;
                    }
                    const descripcion = trabajo.type === 'reparacion' ? trabajo.descripcion : 'N/A';
                    message += `Referencia: ${trabajo.referencia} (${nameToUse})\nEquipo: ${equipoInfo}\nDescripción: ${descripcion}\n\n`;
                });

                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
            } else {
                alert(`No hay trabajos para el día ${formattedFilterDate}.`);
            }
        } else {
            alert('Por favor, selecciona una fecha para compartir los trabajos.');
        }
    };

    return (
        <Container>
            <TopBar>
                <ModalDate>
                    <ModalLabel>Filtrar:</ModalLabel>
                    <DatePicker
                        selected={filterStartDate}
                        onChange={(date: Date | null) => setFilterStartDate(date)}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Seleccionar fecha"
                    />
                </ModalDate>
                <LogoutLink onClick={handleLogout}>Cerrar Sesión</LogoutLink>
            </TopBar>
            <Title>Mis Trabajos</Title>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <Button className="add" onClick={openModal}>Agregar</Button>
                <div style={{ marginLeft: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                        type="text"
                        value={shareName}
                        onChange={(e) => setShareName(e.target.value)}
                        placeholder="Tu nombre"
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>
            </div>
			<Button onClick={shareFilteredOnWhatsApp} disabled={!filterStartDate}>Compartir por WhatsApp</Button>

            {isModalOpen && (
                <ModalOverlay onClick={closeModal}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <h2>Nuevo Trabajo</h2>
                        <ModalForm onSubmit={addWorkItem}>
                            <ModalSelect value={newType} onChange={handleTypeChange}>
                                <option value="reparacion">Reparación</option>
                                <option value="venta">Venta</option>
                            </ModalSelect>
                            <ModalInput
                                type="text"
                                placeholder="Ingrese el número de referencia"
                                value={newReferencia}
                                onChange={handleReferenciaChange}
                                required
                            />
                            {newType === "reparacion" && (
                                <>
                                    <ModalInput
                                        type="text"
                                        placeholder="Descripción de la reparación"
                                        value={newDescripcion}
                                        onChange={(e) => setNewDescripcion(e.target.value)}
                                    />
                                    <ModalInput
                                        type="text"
                                        placeholder="Equipo a reparar"
                                        value={newEquipoReparacion}
                                        onChange={(e) => setNewEquipoReparacion(e.target.value)}
                                    />
        <ModalDate>
            <ModalLabel>Fecha de Inicio:</ModalLabel>
            <DatePicker
                selected={newFechaInicio}
                onChange={(date: Date | null) => setNewFechaInicio(date)}
                dateFormat="yyyy-MM-dd" // Define el formato de visualización y de valor
            />
        </ModalDate>

        <ModalDate>
            <ModalLabel>Fecha de Finalización:</ModalLabel>
            <DatePicker
                selected={newFechaFinal}
                onChange={(date: Date | null) => setNewFechaFinal(date)}
                dateFormat="yyyy-MM-dd"
            />
        </ModalDate>
                                    <ModalSelect value={newEstado} onChange={(e) => setNewEstado(e.target.value as WorkItem["estado"])}>
                                        <option value="pendiente">Pendiente</option>
                                        <option value="en progreso">En Progreso</option>
                                        <option value="completada">Completada</option>
                                    </ModalSelect>
                                    <ModalInput
                                        type="number"
                                        placeholder="Monto al cliente"
                                        value={newMontoClienteReparacion !== undefined ? newMontoClienteReparacion : ""}
                                        onChange={(e) => setNewMontoClienteReparacion(e.target.value ? parseInt(e.target.value) : "")}
                                    />
                                    <ModalInput
                                        type="number"
                                        placeholder="Mano de obra"
                                        value={newManoObra !== undefined ? newManoObra : ""}
                                        onChange={(e) => setNewManoObra(e.target.value ? parseInt(e.target.value) : "")}
                                    />
                                </>
                            )}
                            {newType === "venta" && (
                                <>
                                    <ModalInput
                                        type="text"
                                        placeholder="Cliente"
                                        value={newClienteVenta}
                                        onChange={(e) => setNewClienteVenta(e.target.value)}
                                    />
                                    <ModalInput
                                        type="text"
                                        placeholder="Marca del equipo"
                                        value={newEquipoVentaMarca}
                                        onChange={(e) => setNewEquipoVentaMarca(e.target.value)}
                                    />
                                    <ModalInput
                                        type="text"
                                        placeholder="Modelo del equipo"
                                        value={newEquipoVentaModelo}
                                        onChange={(e) => setNewEquipoVentaModelo(e.target.value)}
                                    />
                                    <ModalInput
                                        type="text"
                                        placeholder="IMEI (opcional)"
                                        value={newEquipoVentaIMEI || ""}
                                        onChange={(e) => setNewEquipoVentaIMEI(e.target.value)}
                                    />
                                    <ModalSelect value={newModalidadVenta} onChange={(e) => setNewModalidadVenta(e.target.value as WorkItem["modalidad"])}>
                                        <option value="De Contado">De Contado</option>
                                        <option value="Apartado">Apartado</option>
                                        <option value="A Crédito">A Crédito</option>
                                    </ModalSelect>
                                    <ModalInput
                                        type="number"
                                        placeholder="Monto al cliente"
                                        value={newMontoClienteVenta !== undefined ? newMontoClienteVenta : ""}
                                        onChange={(e) => setNewMontoClienteVenta(e.target.value ? parseInt(e.target.value) : "")}
                                    />
                                    <ModalInput
                                        type="number"
                                        placeholder="Comisión"
                                        value={newComisionVenta !== undefined ? newComisionVenta : ""}
                                        onChange={(e) => setNewComisionVenta(e.target.value ? parseInt(e.target.value) : "")}
                                    />
        <ModalDate>
            <ModalLabel>Fecha de Venta:</ModalLabel>
            <DatePicker
                selected={newFechaVenta}
                onChange={(date: Date | null) => setNewFechaVenta(date)}
                dateFormat="yyyy-MM-dd"
            />
        </ModalDate>
                                </>
                            )}
                            <ModalDate>
                                <ModalLabel>Etiquetas:</ModalLabel>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {availableTags.map(tag => (
                                        <label key={tag.id} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <input
                                                type="checkbox"
                                                checked={newTags.includes(tag.id)}
                                                onChange={() => handleTagChange(tag.id)}
                                            />
                                            <div
                                                style={{
                                                    width: '10px',
                                                    height: '10px',
                                                    backgroundColor: 'tag.color',
                                                    borderRadius: '2px',
                                                }}
                                            />
                                            <span>{tag.nombre}</span>
                                        </label>
                                    ))}
                                </div>
                            </ModalDate>

                            <Button type="submit" className="add">Guardar Trabajo</Button>
                            <Button type="button" onClick={closeModal}>Cancelar</Button>
                        </ModalForm>
                    </ModalContent>
                </ModalOverlay>
            )}

{currentItems.map((item) => (
    <TaskItem key={item.id} onClick={() => setSelectedItem(item)}>
        <TaskHeader>
            <span>{item.referencia}</span>
                            <div style={{ display: 'flex', gap: '5px', marginLeft: '5px' }}>
                                {item.tags?.map(tagId => {
                                    const tag = availableTags.find(t => t.id === tagId);
                                    if (tag) {
                                        return (
                                            <div key={tag.id} style={{ backgroundColor: tag.color, color: 'white', padding: '2px 5px', borderRadius: '3px', fontSize: '0.7em' }}>
                                                {tag.nombre}
                                            </div>
                                        );
                                    }
                                    return null;
                                })}
                            </div>

            <span>{item.type === 'reparacion' ? '🔧 Reparación' : '🛒 Venta'}</span>
        </TaskHeader>

        <TaskSection>
            {item.type === "reparacion" && (
                <>
                    <span><strong>Equipo:</strong> {item.equipo}</span>
                    <span><strong>Estado:</strong>
                        <TaskStatusSelect
                            value={item.estado}
                            onChange={(e) => handleStatusChange(item.id, e.target.value as WorkItem["estado"])}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <option value="pendiente">Pendiente</option>
                            <option value="en progreso">En Progreso</option>
                            <option value="completada">Completada</option>
                            <option value="eliminar">Eliminar</option>
                        </TaskStatusSelect>
                    </span>
                    {item.fechas?.inicio && <span><strong>Inicio:</strong> {item.fechas.inicio instanceof Date ? item.fechas.inicio.toLocaleDateString() : 'N/A'}</span>}
                    {item.fechas?.final && <span><strong>Fin:</strong> {item.fechas.final instanceof Date ? item.fechas.final.toLocaleDateString() : 'N/A'}</span>}
                    {item.montoCliente !== undefined && <span><strong>Monto:</strong> ${item.montoCliente.toLocaleString()}</span>}
                    {item.manoObra !== undefined && <span><strong>Mano de Obra:</strong> ${item.manoObra.toLocaleString()}</span>}
                </>
            )}

{item.type === "venta" && (
    <>
        <span><strong>Cliente:</strong> {item.cliente}</span>
        <span><strong>Equipo:</strong> {typeof item.equipo === 'object' ? `${(item.equipo as EquipoVenta).marca} ${(item.equipo as EquipoVenta).modelo} (${(item.equipo as EquipoVenta).imei || 'Sin IMEI'})` : item.equipo}</span>
        <span><strong>Modalidad:</strong> {item.modalidad}</span>
        {item.fechas?.venta && <span><strong>Fecha Venta:</strong> {item.fechas.venta instanceof Date ? item.fechas.venta.toLocaleDateString() : 'N/A'}</span>}
        {item.montoCliente !== undefined && <span><strong>Monto:</strong> ${item.montoCliente.toLocaleString()}</span>}
        {item.comision !== undefined && <span><strong>Comisión:</strong> ${item.comision.toLocaleString()}</span>}
        <span><strong>Estado:</strong> Vendido</span>
        <Button className="delete" onClick={(e) => {
            e.stopPropagation(); // Evita que se abra el modal de detalles al hacer clic en eliminar
            setItemToDelete(item.id);
        }}>Eliminar</Button>
    </>
)}
        </TaskSection>

        {itemToDelete === item.id && (
            <DeletePopup onClick={(e) => e.stopPropagation()}>
                <p>¿Seguro que deseas eliminar?</p>
                <Button className="delete" onClick={() => confirmDelete(item.id)}>Sí</Button>
                <Button className="cancel" onClick={() => setItemToDelete(null)}>No</Button>
            </DeletePopup>
        )}
    </TaskItem>
))}

<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
    <Button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
        Anterior
    </Button>
    <span style={{ margin: '0 10px' }}>Página {currentPage} de {totalPages}</span>
    <Button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
        Siguiente
    </Button>
</div>

            {selectedItem && (
                <ModalOverlay onClick={() => setSelectedItem(null)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <h2>Detalles del Trabajo</h2>
                        <p><strong>Referencia:</strong> {selectedItem.referencia}</p>
                        <p><strong>Tipo:</strong> {selectedItem.type === "reparacion" ? "🔧 Reparación" : "🛒 Venta"}</p>
                        {selectedItem.equipo && <p><strong>Equipo:</strong> {typeof selectedItem.equipo === 'object' ? `${(selectedItem.equipo as EquipoVenta).marca} ${(selectedItem.equipo as EquipoVenta).modelo} (${(selectedItem.equipo as EquipoVenta).imei || 'Sin IMEI'})` : selectedItem.equipo}</p>}
                        {selectedItem.descripcion && <p><strong>Descripción:</strong> {selectedItem.descripcion}</p>}
                        {selectedItem.cliente && <p><strong>Cliente:</strong> {selectedItem.cliente}</p>}
                        {selectedItem.modalidad && <p><strong>Modalidad:</strong> {selectedItem.modalidad}</p>}
                        {selectedItem.fechas?.inicio && <p><strong>Fecha de Inicio:</strong> {selectedItem.fechas.inicio instanceof Date ? selectedItem.fechas.inicio.toLocaleDateString() : 'N/A'}</p>}
                        {selectedItem.fechas?.final && <p><strong>Fecha de Finalización:</strong> {selectedItem.fechas.final instanceof Date ? selectedItem.fechas.final.toLocaleDateString() : 'N/A'}</p>}
                        {selectedItem.fechas?.venta && <p><strong>Fecha de Venta:</strong> {selectedItem.fechas.venta instanceof Date ? selectedItem.fechas.venta.toLocaleDateString() : 'N/A'}</p>}
                        {selectedItem.estado && <p><strong>Estado:</strong> {selectedItem.estado}</p>}
                        {selectedItem.montoCliente !== undefined && <p><strong>Monto:</strong> ${selectedItem.montoCliente.toLocaleString()}</p>}
                        {selectedItem.manoObra !== undefined && <p><strong>Mano de Obra:</strong> ${selectedItem.manoObra.toLocaleString()}</p>}
                        {selectedItem.comision !== undefined && <p><strong>Comisión:</strong> ${selectedItem.comision.toLocaleString()}</p>}
                        <h3>Etiquetas:</h3>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {availableTags.map(tag => (
                                <label key={tag.id} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <input
                                        type="checkbox"
                                        checked={modalDetailTags.includes(tag.id)}
                                        onChange={(e) => handleModalDetailTagChange(tag.id, e.target.checked)}
                                    />
                                    <div
                                        style={{
                                            width: '10px',
                                            height: '10px',
                                            backgroundColor: tag.color,
                                            borderRadius: '2px',
                                        }}
                                    />
                                    <span>{tag.nombre}</span>
                                </label>
                            ))}
                        </div>
                        <Button onClick={() => saveItemTags(selectedItem.id, modalDetailTags)}>Guardar</Button>

                        <CloseButton onClick={() => setSelectedItem(null)}>Cerrar</CloseButton>
                    </ModalContent>
                </ModalOverlay>
            )}
        </Container>
    );
};

export default TaskList;