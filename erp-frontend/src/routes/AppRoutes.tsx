import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/dashboard';
import Pedido from '../pages/comercial/Pedido';
import Clientes from '../pages/comercial/Clientes';
import GestaoCarteira from '../pages/comercial/GestaoCarteira';
import ClienteForm from '../pages/comercial/ClienteForm';
import ProdutoForm from '../pages/produtos/ProdutoForm';
import ProdutosList from '../pages/produtos/ProdutosList'; 
import Almoxarifado from '../pages/expedicao/Almoxarifado';
import Estoque from '../pages/expedicao/Estoque';
import ExpedicaoConferencia from '../pages/expedicao/ExpedicaoConferencia'; 
import Industria from '../pages/industria/Index';
import GestaoUsuarios from '../pages/gestaoUsuarios/GestaoUsuarios';
import ContasReceber from '../pages/financeiro/ContasReceber';
import ContasPagar from '../pages/financeiro/ContasPagar';
import FluxoCaixa from '../pages/financeiro/FluxoCaixa';
import OrdemCorteListagem from '../pages/producao/OrdemCorteListagem';
import OrdemCorteForm from '../pages/producao/OrdemCorteForm';
// IMPORTAÇÃO NOVA DO PAINEL DE PRODUÇÃO AQUI
import PainelProducao from '../pages/producao/PainelProducao';
import ListaPedidos from '../pages/comercial/ListaPedidos'; 
import Agent from '../pages/agent/Agent';
import TerminalSetor from '../pages/producao/TerminalSetor'; 
import { ConsultaGrade } from '../pages/comercial/ConsultaGrade';

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    
    {/* AGENTE */}
    <Route path="/agente" element={<Agent />} />

    {/* Comercial */}
    <Route path="/comercial/pedidos" element={<ListaPedidos />} />
    <Route path="/comercial/pedidos/novo" element={<Pedido />} />
    <Route path="/comercial/pedidos/editar/:id" element={<Pedido />} />
    <Route path="/comercial/disponibilidade" element={<ConsultaGrade />} />
    
    <Route path="/comercial/clientes" element={<Clientes />} />
    <Route path="/comercial/clientes/novo" element={<ClienteForm />} />
    <Route path="/comercial/clientes/editar/:id" element={<ClienteForm />} />
    <Route path="/comercial/gestao-carteira" element={<GestaoCarteira />} />

    {/* Produtos */}
    <Route path="/produtos" element={<ProdutosList />} />
    <Route path="/produtos/novo" element={<ProdutoForm />} />
    <Route path="/produtos/editar/:id" element={<ProdutoForm />} />

    {/* Expedição */}
    <Route path="/expedicao/almoxarifado" element={<Almoxarifado />} />
    <Route path="/expedicao/estoque" element={<Estoque/>} />
    <Route path="/expedicao/conferencia" element={<ExpedicaoConferencia />} />

    {/* Indústria */}
    <Route path="/industria" element={<Industria />} />
    <Route path="/industria/producao" element={<PainelProducao />} />
    <Route path="/industria/terminal" element={<TerminalSetor />} />

    {/* Gestão e Financeiro */}
    <Route path="/gestao-usuarios" element={<GestaoUsuarios />} />
    <Route path="/financeiro/contas-receber" element={<ContasReceber />} />
    <Route path="/financeiro/contas-pagar" element={<ContasPagar />} />
    <Route path="/financeiro/fluxo-caixa" element={<FluxoCaixa />} />

    {/* Fábrica */}
    <Route path="/producao/ordens" element={<OrdemCorteListagem />} />
    <Route path="/producao/ordens/novo" element={<OrdemCorteForm />} />
    <Route path="/producao/ordens/editar/:id" element={<OrdemCorteForm />} />
    
    {/* ROTA NOVA DO PAINEL DE PRODUÇÃO AQUI */}
    <Route path="/producao/painel" element={<PainelProducao />} />

  </Routes>
);

export default AppRoutes;