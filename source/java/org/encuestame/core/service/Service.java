/**
 * encuestame: system online surveys Copyright (C) 2009 encuestame Development
 * Team
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of version 3 of the GNU General Public License as published by the
 * Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program; if not, write to the Free Software Foundation, Inc., 59 Temple
 * Place, Suite 330, Boston, MA 02111-1307 USA
 */
package org.encuestame.core.service;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.encuestame.web.beans.commons.MessageSourceFactoryBean;

/**
 * Service.
 * @author Picado, Juan juan@encuestame.org
 * @since 22/05/2009 1:02:45
 * File name: $HeadURL$
 * Revision: $Revision$
 * Last modified: $Date$
 * Last modified by: $Author$
 */
public abstract class Service {

    private MessageSourceFactoryBean messageSource;
    private IDataSource dataEnMeSource;

    protected Log log = LogFactory.getLog(this.getClass());

    /**
     * Constructor.
     */
    public Service() {}

    /**
     * Getter.
     * @return {@link MessageSourceFactoryBean}
     */
    public MessageSourceFactoryBean getMessageSource() {
        return messageSource;
    }


    /**
     * Setter.
     * @param messageSource {@link MessageSourceFactoryBean}
     */
    public void setMessageSource(MessageSourceFactoryBean messageSource) {
        this.messageSource = messageSource;
    }

    /**
     * Getter by propertie Id.
     * @param propertieId propertieId
     * @return value of propertie
     */
    public String getMessageProperties(String propertieId) {
        return getMessageSource() == null ? propertieId : getMessageSource()
                .getMessage(propertieId, null, null);
    }

    /**
     * @return the dataSource
     */
    public IDataSource getDataEnMeSource() {
        return dataEnMeSource;
    }

    /**
     * @param dataSource the dataSource to set
     */
    public void setDataEnMeSource(final IDataSource dataSource) {
        this.dataEnMeSource = dataSource;
    }
}
