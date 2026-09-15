--
-- PostgreSQL database dump
--

\restrict 1vFGWY38Krk7mCeLVcRxT1NGiJDfX5sNlXKNgqMgoGqxBDhX5s9DQXH6FuyVjmg

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

-- Started on 2026-09-15 17:11:56

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 16388)
-- Name: category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.category (
    id character varying(50) CONSTRAINT categories_id_not_null NOT NULL,
    name character varying(50) CONSTRAINT categories_name_not_null NOT NULL,
    slug character varying(50) CONSTRAINT categories_slug_not_null NOT NULL,
    parent_id character varying(50),
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT categories_created_not_null NOT NULL
);


ALTER TABLE public.category OWNER TO postgres;

--
-- TOC entry 5050 (class 0 OID 0)
-- Dependencies: 219
-- Name: TABLE category; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.category IS 'Tabla que contiene las categorias del app tracker';


--
-- TOC entry 227 (class 1259 OID 16884)
-- Name: external_products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.external_products (
    id character varying(50) NOT NULL,
    provider_id character varying(100) NOT NULL,
    product_id character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    price numeric NOT NULL,
    currency character(3) NOT NULL,
    url text NOT NULL,
    category character varying(255),
    aviable boolean DEFAULT true,
    stock integer,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    provider_updated_at timestamp with time zone,
    price_change_claimed_at timestamp with time zone
);


ALTER TABLE public.external_products OWNER TO postgres;

--
-- TOC entry 5051 (class 0 OID 0)
-- Dependencies: 227
-- Name: TABLE external_products; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.external_products IS 'Almacena productos que no se conocen en vista previa';


--
-- TOC entry 228 (class 1259 OID 16909)
-- Name: external_products_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.external_products_images (
    id character varying(50) NOT NULL,
    id_product character varying(50) NOT NULL,
    image text,
    "position" integer NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.external_products_images OWNER TO postgres;

--
-- TOC entry 5052 (class 0 OID 0)
-- Dependencies: 228
-- Name: TABLE external_products_images; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.external_products_images IS 'Tabla que almacena las imagenes por external product';


--
-- TOC entry 231 (class 1259 OID 17047)
-- Name: price_alerts_activation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price_alerts_activation (
    id character varying(50) CONSTRAINT price_alert_activation_id_not_null NOT NULL,
    alert_id character varying(50) CONSTRAINT price_alert_activation_alert_id_not_null NOT NULL,
    history_id character varying(50) CONSTRAINT price_alert_activation_history_id_not_null NOT NULL,
    notified_status character varying(10) DEFAULT 'PENDING'::character varying CONSTRAINT price_alert_activation_notified_status_not_null NOT NULL,
    notified_at timestamp with time zone,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT price_alert_activation_created_not_null NOT NULL
);


ALTER TABLE public.price_alerts_activation OWNER TO postgres;

--
-- TOC entry 5053 (class 0 OID 0)
-- Dependencies: 231
-- Name: TABLE price_alerts_activation; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.price_alerts_activation IS 'Activacion de las alertas por cambios detectados en el historial de cambios de precio';


--
-- TOC entry 220 (class 1259 OID 16396)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id character varying(50) NOT NULL,
    provider_id character varying(100) NOT NULL,
    product_id character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    price numeric NOT NULL,
    currency character(3) NOT NULL,
    url text NOT NULL,
    category character varying(255),
    aviable boolean DEFAULT true,
    stock integer,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    provider_updated_at timestamp without time zone
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 5054 (class 0 OID 0)
-- Dependencies: 220
-- Name: TABLE products; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.products IS 'Tabla que almacena la vista previa de los productos';


--
-- TOC entry 221 (class 1259 OID 16412)
-- Name: products_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products_images (
    id character varying(50) NOT NULL,
    id_product character varying(50) NOT NULL,
    image text,
    "position" integer NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.products_images OWNER TO postgres;

--
-- TOC entry 5055 (class 0 OID 0)
-- Dependencies: 221
-- Name: TABLE products_images; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.products_images IS 'Tabla que almacena las imagenes por producto';


--
-- TOC entry 229 (class 1259 OID 16987)
-- Name: products_price_alerts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products_price_alerts (
    id character varying(50) NOT NULL,
    user_id character varying(50) NOT NULL,
    product_id character varying(50) NOT NULL,
    target_price numeric NOT NULL,
    direction character varying(10) NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.products_price_alerts OWNER TO postgres;

--
-- TOC entry 5056 (class 0 OID 0)
-- Dependencies: 229
-- Name: TABLE products_price_alerts; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.products_price_alerts IS 'Alertas de usuario para cambio de precio en productos';


--
-- TOC entry 230 (class 1259 OID 17017)
-- Name: products_price_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products_price_history (
    id character varying(50) NOT NULL,
    product_id character varying(50) NOT NULL,
    old_price numeric NOT NULL,
    new_price numeric NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    direction character varying(10) NOT NULL,
    difference numeric NOT NULL,
    percentage numeric NOT NULL
);


ALTER TABLE public.products_price_history OWNER TO postgres;

--
-- TOC entry 5057 (class 0 OID 0)
-- Dependencies: 230
-- Name: TABLE products_price_history; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.products_price_history IS 'Historial de cambio de precios';


--
-- TOC entry 224 (class 1259 OID 16781)
-- Name: provider_category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.provider_category (
    id character varying(50) NOT NULL,
    category_id character varying(50),
    provider character varying(50),
    external_id character varying(100),
    name character varying(255)
);


ALTER TABLE public.provider_category OWNER TO postgres;

--
-- TOC entry 5058 (class 0 OID 0)
-- Dependencies: 224
-- Name: TABLE provider_category; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.provider_category IS 'relacion de categorias de app tracker contra categorias de el provider';


--
-- TOC entry 226 (class 1259 OID 16831)
-- Name: provider_category_cache; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.provider_category_cache (
    id character varying(50) NOT NULL,
    category_id character varying(50) NOT NULL,
    provider_id character varying(50) NOT NULL,
    total integer,
    has_more boolean DEFAULT true,
    last_provider_offset integer DEFAULT 0,
    last_sync_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.provider_category_cache OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16794)
-- Name: providers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.providers (
    name character varying(50) NOT NULL,
    token text,
    active boolean DEFAULT true,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    logo text NOT NULL,
    nickname character varying(100) NOT NULL
);


ALTER TABLE public.providers OWNER TO postgres;

--
-- TOC entry 5059 (class 0 OID 0)
-- Dependencies: 225
-- Name: TABLE providers; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.providers IS 'Tabla que almacena los provedores para los productos';


--
-- TOC entry 232 (class 1259 OID 17082)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id character varying(50) NOT NULL,
    name character varying(50) NOT NULL,
    permissions jsonb DEFAULT '[]'::jsonb NOT NULL,
    description character varying(255) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 5060 (class 0 OID 0)
-- Dependencies: 232
-- Name: TABLE roles; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.roles IS 'roles existentes para el produc tracker';


--
-- TOC entry 222 (class 1259 OID 16420)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id character varying(50) NOT NULL,
    name character varying(100),
    email character varying(255),
    password character varying(255) NOT NULL,
    username character varying(100) NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone,
    last_reset_password timestamp with time zone,
    last_change_password timestamp with time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 5061 (class 0 OID 0)
-- Dependencies: 222
-- Name: TABLE users; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.users IS 'tabla que almacena usuarios';


--
-- TOC entry 223 (class 1259 OID 16427)
-- Name: users_product_favorite; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users_product_favorite (
    user_id character varying(50) NOT NULL,
    product_id character varying(255) NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users_product_favorite OWNER TO postgres;

--
-- TOC entry 5062 (class 0 OID 0)
-- Dependencies: 223
-- Name: TABLE users_product_favorite; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.users_product_favorite IS 'Tabla que almacena los productos favoritos del usuario';


--
-- TOC entry 233 (class 1259 OID 17098)
-- Name: users_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users_roles (
    user_id character varying NOT NULL,
    role_id character varying(50) NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.users_roles OWNER TO postgres;

--
-- TOC entry 5063 (class 0 OID 0)
-- Dependencies: 233
-- Name: TABLE users_roles; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.users_roles IS 'Roles asignados al usuario';


--
-- TOC entry 4840 (class 2606 OID 16434)
-- Name: category categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4869 (class 2606 OID 16920)
-- Name: external_products_images external_products_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_products_images
    ADD CONSTRAINT external_products_images_pkey PRIMARY KEY (id);


--
-- TOC entry 4865 (class 2606 OID 16901)
-- Name: external_products external_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_products
    ADD CONSTRAINT external_products_pkey PRIMARY KEY (id);


--
-- TOC entry 4876 (class 2606 OID 17060)
-- Name: price_alerts_activation price_alert_activation_alert_id_history_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_alerts_activation
    ADD CONSTRAINT price_alert_activation_alert_id_history_id_key UNIQUE (alert_id, history_id);


--
-- TOC entry 4878 (class 2606 OID 17058)
-- Name: price_alerts_activation price_alert_activation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_alerts_activation
    ADD CONSTRAINT price_alert_activation_pkey PRIMARY KEY (id);


--
-- TOC entry 4847 (class 2606 OID 16436)
-- Name: products_images products_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products_images
    ADD CONSTRAINT products_images_pkey PRIMARY KEY (id);


--
-- TOC entry 4843 (class 2606 OID 16438)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 4871 (class 2606 OID 17004)
-- Name: products_price_alerts products_price_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products_price_alerts
    ADD CONSTRAINT products_price_alerts_pkey PRIMARY KEY (id);


--
-- TOC entry 4873 (class 2606 OID 17029)
-- Name: products_price_history products_price_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products_price_history
    ADD CONSTRAINT products_price_history_pkey PRIMARY KEY (id);


--
-- TOC entry 4861 (class 2606 OID 16855)
-- Name: provider_category_cache provider_category_cache_category_id_provider_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provider_category_cache
    ADD CONSTRAINT provider_category_cache_category_id_provider_id_key UNIQUE (category_id, provider_id);


--
-- TOC entry 4863 (class 2606 OID 16843)
-- Name: provider_category_cache provider_category_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provider_category_cache
    ADD CONSTRAINT provider_category_cache_pkey PRIMARY KEY (id);


--
-- TOC entry 4857 (class 2606 OID 16788)
-- Name: provider_category provider_category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provider_category
    ADD CONSTRAINT provider_category_pkey PRIMARY KEY (id);


--
-- TOC entry 4859 (class 2606 OID 16806)
-- Name: providers providers_name_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_name_pkey PRIMARY KEY (name);


--
-- TOC entry 4880 (class 2606 OID 17092)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 4867 (class 2606 OID 16903)
-- Name: external_products unique_provider_external_product; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_products
    ADD CONSTRAINT unique_provider_external_product UNIQUE (provider_id, product_id);


--
-- TOC entry 4845 (class 2606 OID 16440)
-- Name: products unique_provider_product; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT unique_provider_product UNIQUE (provider_id, product_id);


--
-- TOC entry 4849 (class 2606 OID 16984)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4853 (class 2606 OID 16444)
-- Name: users_product_favorite users_product_favorite_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_product_favorite
    ADD CONSTRAINT users_product_favorite_pkey PRIMARY KEY (product_id, user_id);


--
-- TOC entry 4855 (class 2606 OID 16944)
-- Name: users_product_favorite users_product_favorite_user_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_product_favorite
    ADD CONSTRAINT users_product_favorite_user_id_product_id_key UNIQUE (user_id, product_id);


--
-- TOC entry 4882 (class 2606 OID 17108)
-- Name: users_roles users_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_roles
    ADD CONSTRAINT users_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- TOC entry 4851 (class 2606 OID 16986)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4841 (class 1259 OID 16445)
-- Name: fki_parent_id_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_parent_id_fk ON public.category USING btree (parent_id);


--
-- TOC entry 4874 (class 1259 OID 17136)
-- Name: fki_price_alert_activation_alert_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_price_alert_activation_alert_id_fkey ON public.price_alerts_activation USING btree (alert_id);


--
-- TOC entry 4887 (class 2606 OID 16789)
-- Name: provider_category category_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provider_category
    ADD CONSTRAINT category_id_fk FOREIGN KEY (category_id) REFERENCES public.category(id) NOT VALID;


--
-- TOC entry 4890 (class 2606 OID 16933)
-- Name: external_products_images external_products_images_id_product_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_products_images
    ADD CONSTRAINT external_products_images_id_product_fkey FOREIGN KEY (id_product) REFERENCES public.external_products(id) NOT VALID;


--
-- TOC entry 4883 (class 2606 OID 16446)
-- Name: category parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT parent_id_fk FOREIGN KEY (parent_id) REFERENCES public.category(id) NOT VALID;


--
-- TOC entry 5064 (class 0 OID 0)
-- Dependencies: 4883
-- Name: CONSTRAINT parent_id_fk ON category; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON CONSTRAINT parent_id_fk ON public.category IS 'referencia sub categorias';


--
-- TOC entry 4894 (class 2606 OID 17131)
-- Name: price_alerts_activation price_alert_activation_alert_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_alerts_activation
    ADD CONSTRAINT price_alert_activation_alert_id_fkey FOREIGN KEY (alert_id) REFERENCES public.products_price_alerts(id) ON DELETE CASCADE;


--
-- TOC entry 4895 (class 2606 OID 17066)
-- Name: price_alerts_activation price_alert_activation_history_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_alerts_activation
    ADD CONSTRAINT price_alert_activation_history_id_fkey FOREIGN KEY (history_id) REFERENCES public.products_price_history(id);


--
-- TOC entry 4885 (class 2606 OID 16928)
-- Name: products_images products_images_id_product_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products_images
    ADD CONSTRAINT products_images_id_product_fkey FOREIGN KEY (id_product) REFERENCES public.products(id) NOT VALID;


--
-- TOC entry 4891 (class 2606 OID 17012)
-- Name: products_price_alerts products_price_alerts_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products_price_alerts
    ADD CONSTRAINT products_price_alerts_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.external_products(id);


--
-- TOC entry 4892 (class 2606 OID 17124)
-- Name: products_price_alerts products_price_alerts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products_price_alerts
    ADD CONSTRAINT products_price_alerts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4893 (class 2606 OID 17030)
-- Name: products_price_history products_price_history_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products_price_history
    ADD CONSTRAINT products_price_history_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.external_products(id);


--
-- TOC entry 4888 (class 2606 OID 16821)
-- Name: provider_category provider_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provider_category
    ADD CONSTRAINT provider_fk FOREIGN KEY (provider) REFERENCES public.providers(name) NOT VALID;


--
-- TOC entry 4889 (class 2606 OID 16904)
-- Name: external_products provider_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_products
    ADD CONSTRAINT provider_id_fk FOREIGN KEY (provider_id) REFERENCES public.providers(name);


--
-- TOC entry 4884 (class 2606 OID 16826)
-- Name: products provider_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT provider_id_fk FOREIGN KEY (provider_id) REFERENCES public.providers(name) NOT VALID;


--
-- TOC entry 4886 (class 2606 OID 16938)
-- Name: users_product_favorite users_product_favorite_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_product_favorite
    ADD CONSTRAINT users_product_favorite_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.external_products(id) NOT VALID;


--
-- TOC entry 4896 (class 2606 OID 17114)
-- Name: users_roles users_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_roles
    ADD CONSTRAINT users_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) NOT VALID;


--
-- TOC entry 4897 (class 2606 OID 17119)
-- Name: users_roles users_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_roles
    ADD CONSTRAINT users_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2026-09-15 17:11:57

--
-- PostgreSQL database dump complete
--

\unrestrict 1vFGWY38Krk7mCeLVcRxT1NGiJDfX5sNlXKNgqMgoGqxBDhX5s9DQXH6FuyVjmg

